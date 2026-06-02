import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, usersTable, walletsTable, transactionsTable } from "@workspace/db";

const router = Router();
const NGN_RATE = 1500;

function paystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const expected = createHmac("sha512", paystackSecret()).update(rawBody).digest("hex");
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

async function ensureUser(email: string) {
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (rows.length) return rows[0];
  const [u] = await db.insert(usersTable).values({ email, fullName: "PayVora User" }).returning();
  return u;
}

async function ensureWallet(userId: number) {
  const rows = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).limit(1);
  if (rows.length) return rows[0];
  const [w] = await db.insert(walletsTable).values({ userId }).returning();
  return w;
}

/**
 * POST /api/webhooks/paystack
 *
 * HMAC-SHA512 verified. charge.success is fully idempotent:
 *   - Uses stored amountUsd from DB as the authoritative credit amount
 *   - DB transaction only fires when status is still "pending"
 *   - Re-delivered webhooks for an already-credited reference are silently ignored
 * Always responds 200 — Paystack retries on any non-200.
 */
router.post("/paystack", async (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  if (typeof signature !== "string" || !signature) {
    res.status(400).json({ error: "Missing X-Paystack-Signature header" });
    return;
  }

  const rawBody: Buffer = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body));

  if (!verifyPaystackSignature(rawBody, signature)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Malformed JSON payload" });
    return;
  }

  req.log?.info({ paystackEvent: event.event }, "Paystack webhook received");

  switch (event.event) {
    case "charge.success": {
      const tx = event.data as {
        reference: string;
        amount: number;
        currency: string;
        customer: { email: string };
        metadata: unknown;
      };

      const amountMajor = tx.amount / 100;

      try {
        const existing = await db
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable.reference, tx.reference))
          .limit(1);

        if (existing.length && existing[0].status === "success") {
          req.log?.info({ reference: tx.reference }, "charge.success already processed — skipping");
          break;
        }

        const user   = await ensureUser(tx.customer?.email ?? "webhook@payvora.io");
        const wallet = await ensureWallet(user.id);

        // Prefer stored amountUsd (accurate, avoids FX drift between initiate and webhook)
        const creditUsd = (existing.length && existing[0].amountUsd != null)
          ? Number(existing[0].amountUsd)
          : (tx.currency === "USD" ? amountMajor : amountMajor / NGN_RATE);

        await db.transaction(async (dbTx) => {
          if (existing.length) {
            await dbTx
              .update(transactionsTable)
              .set({ status: "success", paystackStatus: "success", updatedAt: new Date() })
              .where(
                and(
                  eq(transactionsTable.reference, tx.reference),
                  eq(transactionsTable.status, "pending"),
                ),
              );
          } else {
            await dbTx.insert(transactionsTable).values({
              userId:         user.id,
              reference:      tx.reference,
              type:           "deposit",
              title:          "Paystack Deposit",
              amountUsd:      String(tx.currency === "USD" ? amountMajor : amountMajor / NGN_RATE),
              amountNgn:      String(tx.currency === "NGN" ? amountMajor : amountMajor * NGN_RATE),
              currency:       "NGN",
              status:         "success",
              direction:      "in",
              paystackStatus: "success",
              metadata:       tx.metadata as Record<string, unknown>,
            });
          }

          await dbTx
            .update(walletsTable)
            .set({
              usdBalance: String(Math.max(0, Number(wallet.usdBalance) + creditUsd)),
              updatedAt:  new Date(),
            })
            .where(eq(walletsTable.userId, user.id));
        });

        req.log?.info(
          { reference: tx.reference, creditUsd, currency: tx.currency },
          "charge.success — wallet credited",
        );
      } catch (err) {
        req.log?.error(err, "charge.success handler failed");
      }
      break;
    }

    case "transfer.success":
      req.log?.info({ data: event.data }, "transfer.success");
      break;

    case "transfer.failed":
    case "transfer.reversed":
      req.log?.warn({ event: event.event, data: event.data }, "transfer failed/reversed");
      break;

    default:
      req.log?.info({ event: event.event }, "Unhandled Paystack event");
  }

  res.status(200).json({ received: true });
});

export default router;
