import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

const router = Router();

function paystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

/**
 * Verify Paystack webhook signature using HMAC-SHA512.
 * req.body MUST be the raw Buffer — mount express.raw() for this path
 * before express.json() in app.ts.
 */
function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const expected = createHmac("sha512", paystackSecret())
    .update(rawBody)
    .digest("hex");

  try {
    const sigBuf  = Buffer.from(signature, "hex");
    const expBuf  = Buffer.from(expected,  "hex");
    return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * POST /api/webhooks/paystack
 *
 * Paystack sends a POST with the event JSON and an X-Paystack-Signature header.
 * We verify the HMAC, then dispatch on event.event.
 * Always respond 200 immediately — Paystack will retry on any non-200.
 */
router.post("/paystack", (req, res) => {
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
      req.log?.info(
        { reference: tx.reference, amount: tx.amount / 100, currency: tx.currency },
        "charge.success",
      );
      // TODO: look up order by tx.reference and credit user wallet in DB:
      // await creditUserWallet(tx.reference, tx.amount / 100, tx.currency);
      break;
    }

    case "transfer.success": {
      req.log?.info({ data: event.data }, "transfer.success");
      // TODO: mark withdrawal as completed in DB
      break;
    }

    case "transfer.failed":
    case "transfer.reversed": {
      req.log?.warn({ event: event.event, data: event.data }, "transfer failed/reversed");
      // TODO: refund user balance in DB
      break;
    }

    default:
      req.log?.info({ event: event.event }, "Unhandled Paystack event");
  }

  res.status(200).json({ received: true });
});

export default router;
