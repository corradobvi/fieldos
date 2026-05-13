import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

const STRIPE_API = "https://api.stripe.com/v1";

// Map piano+intervallo → env var name
const PRICE_ENV: Record<string, Record<string, string>> = {
  mister:     { mensile: "STRIPE_PRICE_MISTER_MENSILE",     annuale: "STRIPE_PRICE_MISTER_ANNUALE" },
  mister_pro: { mensile: "STRIPE_PRICE_MISTER_PRO_MENSILE", annuale: "STRIPE_PRICE_MISTER_PRO_ANNUALE" },
  societa:    { mensile: "STRIPE_PRICE_SOCIETA_MENSILE",     annuale: "STRIPE_PRICE_SOCIETA_ANNUALE" },
};

function getPriceId(piano: string, intervallo: string): string | null {
  return process.env[PRICE_ENV[piano]?.[intervallo] ?? ""] || null;
}

// Encode a flat object as application/x-www-form-urlencoded with bracket notation
function stripeEncode(obj: Record<string, string | number>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function stripePost(path: string, params: Record<string, string | number>): Promise<any> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: stripeEncode(params),
  });
  const data = await resp.json() as any;
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}

// POST /api/v2/stripe/create-checkout
router.post("/stripe/create-checkout", async (req, res) => {
  const { piano, intervallo, societyId } = req.body as Record<string, string | number | undefined>;

  if (!piano || !intervallo || !societyId) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const priceId = getPriceId(String(piano), String(intervallo));
  if (!priceId) {
    return res.status(400).json({ error: "invalid_plan_or_interval" });
  }

  const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";

  try {
    const session = await stripePost("/checkout/sessions", {
      mode: "subscription",
      "payment_method_types[0]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": 1,
      "success_url": `${appUrl}/?abbonato=true`,
      "cancel_url": `${appUrl}/subscribe`,
      "metadata[societyId]": String(societyId),
      "metadata[piano]": String(piano),
      "metadata[intervallo]": String(intervallo),
    });

    logger.info({ societyId, piano, intervallo }, "stripe checkout session created");
    return res.json({ url: session.url });
  } catch (e: any) {
    logger.error({ err: e }, "stripe create-checkout error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});

// POST /api/v2/stripe/webhook
// express.json() verify callback stores rawBody on req — see app.ts
router.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn("STRIPE_WEBHOOK_SECRET not set — webhook skipped");
    return res.sendStatus(200);
  }

  const rawBody: Buffer | undefined = (req as any).rawBody;
  if (!sig || !rawBody) {
    return res.status(400).json({ error: "missing_signature" });
  }

  // Verify Stripe webhook signature
  // Header format: t=timestamp,v1=hash[,v0=...]
  const parts = Object.fromEntries(sig.split(",").map(p => p.split("=")));
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) {
    return res.status(400).json({ error: "invalid_signature_format" });
  }

  // Reject stale events (>5 min)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.status(400).json({ error: "stale_event" });
  }

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(v1, "hex");

  if (
    expectedBuf.length !== receivedBuf.length ||
    !timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    logger.warn({ sig }, "stripe webhook signature mismatch");
    return res.status(400).json({ error: "invalid_signature" });
  }

  const event = req.body as any;
  logger.info({ type: event?.type }, "stripe webhook received");

  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object;
    const societyId  = session?.metadata?.societyId;
    const customerId = session?.customer;
    const subId      = session?.subscription;

    if (societyId && customerId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status = 'active',
               stripe_customer_id      = ?,
               stripe_subscription_id  = ?
           WHERE id = ?`,
          [customerId, subId ?? null, Number(societyId)]
        );
        logger.info({ societyId, customerId }, "stripe: society activated");
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed");
      }
    }
  }

  return res.sendStatus(200);
});

export default router;
