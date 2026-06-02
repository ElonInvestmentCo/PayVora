import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, walletsTable, transactionsTable, usersTable } from "@workspace/db";

const router = Router();

/**
 * GET /api/wallet/balance?email=...
 * Returns USD and NGN balances from the DB wallet for the given user.
 */
router.get("/wallet/balance", async (req, res) => {
  try {
    const email = (req.query["email"] as string) ?? "customer@payvora.io";

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!users.length) {
      res.json({ usdBalance: 0, ngnBalance: 0 });
      return;
    }

    const wallets = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, users[0].id))
      .limit(1);

    if (!wallets.length) {
      res.json({ usdBalance: 0, ngnBalance: 0 });
      return;
    }

    res.json({
      usdBalance: Number(wallets[0].usdBalance),
      ngnBalance: Number(wallets[0].ngnBalance),
    });
  } catch (err) {
    req.log?.error(err, "GET /wallet/balance");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/wallet/transactions?email=...&limit=50
 * Returns transaction history for the given user, newest first.
 */
router.get("/wallet/transactions", async (req, res) => {
  try {
    const email  = (req.query["email"] as string) ?? "customer@payvora.io";
    const limit  = Math.min(Number(req.query["limit"] ?? 50), 100);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!users.length) {
      res.json({ transactions: [] });
      return;
    }

    const rows = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, users[0].id))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit);

    res.json({
      transactions: rows.map((t) => ({
        id:        t.id,
        reference: t.reference,
        type:      t.type,
        title:     t.title,
        amount:    Number(t.amountUsd ?? t.amountNgn ?? 0),
        currency:  t.currency,
        status:    t.status,
        direction: t.direction,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    req.log?.error(err, "GET /wallet/transactions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
