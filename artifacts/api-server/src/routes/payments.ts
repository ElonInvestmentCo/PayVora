import { Router } from "express";
import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, usersTable, walletsTable, transactionsTable } from "@workspace/db";

const PAYSTACK_BASE = "https://api.paystack.co";

/** Approximate USD ↔ NGN rate (update via config or FX API in production) */
const NGN_RATE = 1500;

function secret(): string {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY not set");
  return k;
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

const router = Router();

/**
 * POST /api/payments/initiate
 * Body: { email?, amount (major units), currency? ("USD"|"NGN"), metadata? }
 *
 * Always sends NGN to Paystack (only NGN is supported on most live NG accounts).
 * USD amounts are converted at NGN_RATE and stored in both amountUsd + amountNgn.
 * Returns: { authorizationUrl, accessCode, reference }
 */
router.post("/payments/initiate", async (req, res) => {
  try {
    const {
      email = "customer@payvora.io",
      amount,
      currency = "USD",
      metadata,
    } = req.body as {
      email?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };

    if (amount == null || Number(amount) <= 0) {
      res.status(400).json({ error: "amount must be a positive number" });
      return;
    }

    const amountNum = Number(amount);
    const amountUsd = currency === "USD" ? amountNum : amountNum / NGN_RATE;
    const amountNgn = currency === "USD" ? amountNum * NGN_RATE : amountNum;

    // Paystack always receives NGN (kobo = NGN × 100)
    const paystackKobo = Math.round(amountNgn * 100);
    const reference = `pv-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const user = await ensureUser(email);
    await ensureWallet(user.id);

    await db.insert(transactionsTable).values({
      userId:    user.id,
      reference,
      type:      "deposit",
      title:     "Wallet Deposit",
      amountUsd: String(amountUsd),
      amountNgn: String(amountNgn),
      currency:  "NGN",
      status:    "pending",
      direction: "in",
      metadata:  { email, originalCurrency: currency, ...(metadata ?? {}) },
    });

    const upstream = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount:    paystackKobo,
        currency:  "NGN",
        reference,
        metadata:  { originalCurrency: currency, ...(metadata ?? {}) },
      }),
    });

    const body = (await upstream.json()) as {
      status: boolean;
      message: string;
      data: { authorization_url: string; access_code: string; reference: string };
    };

    if (!upstream.ok || !body.status) {
      await db.delete(transactionsTable).where(eq(transactionsTable.reference, reference));
      res.status(502).json({ error: body.message ?? "Failed to initialise payment" });
      return;
    }

    res.json({
      authorizationUrl: body.data.authorization_url,
      accessCode:       body.data.access_code,
      reference:        body.data.reference,
      displayAmount:    amountUsd,
      displayCurrency:  "USD",
    });
  } catch (err) {
    req.log?.error(err, "POST /payments/initiate");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/payments/verify/:reference
 * Checks DB first (already-credited → instant 200, no Paystack call).
 * Falls through to live Paystack check; atomically credits wallet on success.
 * Wallet credit uses the stored amountUsd (preserves the original user-facing amount).
 */
router.get("/payments/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const existing = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.reference, reference))
      .limit(1);

    if (existing.length && existing[0].status === "success") {
      res.json({
        status:   "success",
        reference,
        amount:   Number(existing[0].amountUsd ?? 0),
        currency: "USD",
        source:   "db",
      });
      return;
    }

    const upstream = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret()}` } },
    );

    const body = (await upstream.json()) as {
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        paid_at: string | null;
        channel: string;
        customer: { email: string };
        metadata: unknown;
      };
    };

    if (!upstream.ok || !body.status) {
      res.status(upstream.status === 404 ? 404 : 502).json({
        error: body.message ?? "Failed to verify payment",
      });
      return;
    }

    const tx = body.data;

    if (tx.status === "success" && existing.length && existing[0].status !== "success") {
      const user   = await ensureUser(tx.customer?.email ?? "customer@payvora.io");
      const wallet = await ensureWallet(user.id);

      // Use stored USD amount (accurate, avoids live FX drift)
      const creditUsd = existing[0].amountUsd != null
        ? Number(existing[0].amountUsd)
        : tx.amount / 100 / NGN_RATE;

      await db.transaction(async (dbTx) => {
        await dbTx
          .update(transactionsTable)
          .set({ status: "success", paystackStatus: tx.status, updatedAt: new Date() })
          .where(
            and(
              eq(transactionsTable.reference, reference),
              eq(transactionsTable.status, "pending"),
            ),
          );

        await dbTx
          .update(walletsTable)
          .set({
            usdBalance: String(Math.max(0, Number(wallet.usdBalance) + creditUsd)),
            updatedAt:  new Date(),
          })
          .where(eq(walletsTable.userId, user.id));
      });
    }

    const amountUsd = existing.length && existing[0].amountUsd != null
      ? Number(existing[0].amountUsd)
      : tx.amount / 100 / NGN_RATE;

    res.json({
      status:        tx.status,
      reference:     tx.reference,
      amount:        amountUsd,
      currency:      "USD",
      paidAt:        tx.paid_at,
      channel:       tx.channel,
      customerEmail: tx.customer?.email,
      metadata:      tx.metadata,
    });
  } catch (err) {
    req.log?.error(err, "GET /payments/verify");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
