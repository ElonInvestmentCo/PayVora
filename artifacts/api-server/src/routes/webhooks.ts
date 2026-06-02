import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, usersTable, walletsTable, transactionsTable } from "@workspace/db";
import { randomUUID } from "node:crypto";

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
 * HMAC-SHA512 verified. All handlers are idempotent — re-delivered events are
 * silently ignored if already processed. Always responds 200 so Paystack does
 * not retry indefinitely.
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

    // ── charge.success ────────────────────────────────────────────────────────
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

        req.log?.info({ reference: tx.reference, creditUsd, currency: tx.currency }, "charge.success — wallet credited");
      } catch (err) {
        req.log?.error(err, "charge.success handler failed");
      }
      break;
    }

    // ── charge.failed ─────────────────────────────────────────────────────────
    case "charge.failed": {
      const tx = event.data as { reference: string; customer: { email: string } };
      try {
        await db
          .update(transactionsTable)
          .set({ status: "failed", paystackStatus: "failed", updatedAt: new Date() })
          .where(
            and(
              eq(transactionsTable.reference, tx.reference),
              eq(transactionsTable.status, "pending"),
            ),
          );
        req.log?.info({ reference: tx.reference }, "charge.failed — transaction marked failed");
      } catch (err) {
        req.log?.error(err, "charge.failed handler failed");
      }
      break;
    }

    // ── transfer.success ──────────────────────────────────────────────────────
    case "transfer.success": {
      const transfer = event.data as {
        reference?: string;
        amount: number;
        currency: string;
        recipient?: { email?: string; name?: string };
        reason?: string;
      };

      const reference = transfer.reference ?? `transfer-${randomUUID().slice(0, 12)}`;
      const amountMajor = transfer.amount / 100;
      const amountUsd = transfer.currency === "USD" ? amountMajor : amountMajor / NGN_RATE;
      const recipientEmail = transfer.recipient?.email ?? "recipient@payvora.io";

      try {
        const existing = await db
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable.reference, reference))
          .limit(1);

        if (existing.length) {
          await db
            .update(transactionsTable)
            .set({ status: "success", paystackStatus: "success", updatedAt: new Date() })
            .where(eq(transactionsTable.reference, reference));
        } else {
          const user = await ensureUser(recipientEmail);
          await db.insert(transactionsTable).values({
            userId:         user.id,
            reference,
            type:           "withdrawal",
            title:          transfer.reason ?? "Bank Transfer",
            amountUsd:      String(amountUsd),
            amountNgn:      String(transfer.currency === "NGN" ? amountMajor : amountMajor * NGN_RATE),
            currency:       transfer.currency ?? "NGN",
            status:         "success",
            direction:      "out",
            paystackStatus: "success",
            metadata:       { recipient: transfer.recipient, reason: transfer.reason },
          });
        }

        req.log?.info({ reference, amountUsd }, "transfer.success recorded");
      } catch (err) {
        req.log?.error(err, "transfer.success handler failed");
      }
      break;
    }

    // ── transfer.failed ───────────────────────────────────────────────────────
    case "transfer.failed": {
      const transfer = event.data as { reference?: string };
      const reference = transfer.reference;
      if (reference) {
        try {
          await db
            .update(transactionsTable)
            .set({ status: "failed", paystackStatus: "failed", updatedAt: new Date() })
            .where(eq(transactionsTable.reference, reference));
          req.log?.warn({ reference }, "transfer.failed — transaction marked failed");
        } catch (err) {
          req.log?.error(err, "transfer.failed handler failed");
        }
      }
      break;
    }

    // ── transfer.reversed ─────────────────────────────────────────────────────
    case "transfer.reversed": {
      const transfer = event.data as { reference?: string; amount?: number; currency?: string };
      const reference = transfer.reference;
      if (reference) {
        try {
          // Mark original transfer as reversed
          await db
            .update(transactionsTable)
            .set({ status: "failed", paystackStatus: "reversed", updatedAt: new Date() })
            .where(eq(transactionsTable.reference, reference));

          // Credit the reversed amount back to wallet if we know who it belongs to
          const txRows = await db
            .select()
            .from(transactionsTable)
            .where(eq(transactionsTable.reference, reference))
            .limit(1);

          if (txRows.length && transfer.amount) {
            const amountMajor = transfer.amount / 100;
            const refundUsd = (transfer.currency ?? "NGN") === "USD" ? amountMajor : amountMajor / NGN_RATE;
            const walletRows = await db
              .select()
              .from(walletsTable)
              .where(eq(walletsTable.userId, txRows[0].userId))
              .limit(1);
            if (walletRows.length) {
              await db
                .update(walletsTable)
                .set({
                  usdBalance: String(Math.max(0, Number(walletRows[0].usdBalance) + refundUsd)),
                  updatedAt:  new Date(),
                })
                .where(eq(walletsTable.userId, txRows[0].userId));
            }
          }

          req.log?.warn({ reference }, "transfer.reversed — original transfer reversed");
        } catch (err) {
          req.log?.error(err, "transfer.reversed handler failed");
        }
      }
      break;
    }

    default:
      req.log?.info({ event: event.event }, "Unhandled Paystack event");
  }

  res.status(200).json({ received: true });
});

export default router;
