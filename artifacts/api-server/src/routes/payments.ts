import { Router } from "express";

const PAYSTACK_BASE = "https://api.paystack.co";

function paystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

const router = Router();

/**
 * POST /api/payments/initiate
 *
 * Body: { email: string, amount: number (in major units, e.g. NGN), currency?: string, metadata?: object }
 * Returns: { authorizationUrl, accessCode, reference }
 */
router.post("/payments/initiate", async (req, res) => {
  try {
    const { email, amount, currency = "NGN", metadata } = req.body as {
      email: string;
      amount: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };

    if (!email || amount == null) {
      res.status(400).json({ error: "email and amount are required" });
      return;
    }

    const amountKobo = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      res.status(400).json({ error: "amount must be a positive number" });
      return;
    }

    const upstream = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount: amountKobo, currency, metadata }),
    });

    const body = (await upstream.json()) as {
      status: boolean;
      message: string;
      data: { authorization_url: string; access_code: string; reference: string };
    };

    if (!upstream.ok || !body.status) {
      res.status(502).json({ error: body.message ?? "Failed to initialize payment" });
      return;
    }

    res.json({
      authorizationUrl: body.data.authorization_url,
      accessCode:       body.data.access_code,
      reference:        body.data.reference,
    });
  } catch (err) {
    req.log?.error(err, "POST /payments/initiate");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/payments/verify/:reference
 *
 * Returns normalised transaction details for the given Paystack reference.
 */
router.get("/payments/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const upstream = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret()}` },
      },
    );

    const body = (await upstream.json()) as {
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        paid_at: string;
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
    res.json({
      status:        tx.status,
      reference:     tx.reference,
      amount:        tx.amount / 100,
      currency:      tx.currency,
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
