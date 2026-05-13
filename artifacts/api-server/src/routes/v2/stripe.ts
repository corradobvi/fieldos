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

// Pro-rata % per mese (chiave = mese UTC 0-indexed: 0=Jan … 11=Dec)
// Giugno (5) e Luglio (6) = null → piano annuale non disponibile
const PRORATA_PCT: Record<number, number | null> = {
  7: 100, // Agosto
  8: 92,  // Settembre
  9: 83,  // Ottobre
  10: 75, // Novembre
  11: 67, // Dicembre
  0: 58,  // Gennaio
  1: 50,  // Febbraio
  2: 42,  // Marzo
  3: 33,  // Aprile
  4: 25,  // Maggio
  5: null, // Giugno — solo mensile
  6: null, // Luglio  — solo mensile
};

// Restituisce il timestamp Unix del prossimo 1° agosto
// Logica stagione sportiva: se siamo da ago a dic la stagione è in corso → prossimo agosto è anno+1
//                           se siamo da gen a lug la stagione in corso termina il 31 lug → prossimo agosto è quest'anno
function nextAugFirst(): number {
  const now = new Date();
  const month = now.getUTCMonth(); // 0-indexed
  const day   = now.getUTCDate();
  // Se siamo esattamente il 1° agosto: il prossimo 1° agosto è l'anno prossimo
  const isToday = month === 7 && day === 1;
  const anchorYear = (month >= 7 && !isToday)
    ? now.getUTCFullYear() + 1   // ago(dopo 1°)–dic → anno prossimo
    : (month < 7)
      ? now.getUTCFullYear()     // gen–lug → quest'anno
      : now.getUTCFullYear() + 1; // 1° ago esatto → anno prossimo
  return Math.floor(Date.UTC(anchorYear, 7, 1) / 1000);
}

function getPriceId(piano: string, intervallo: string): string | null {
  return process.env[PRICE_ENV[piano]?.[intervallo] ?? ""] || null;
}

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
  const { piano, intervallo, societyId, email } = req.body as Record<string, string | number | undefined>;

  if (!piano || !intervallo || !societyId) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // Blocca piano annuale in giugno e luglio
  if (String(intervallo) === "annuale") {
    const month = new Date().getUTCMonth();
    if (PRORATA_PCT[month] === null) {
      return res.status(400).json({
        error: "annual_not_available",
        detail: "Il piano annuale non è disponibile in giugno e luglio. Usa il piano mensile.",
      });
    }
  }

  const priceId = getPriceId(String(piano), String(intervallo));
  if (!priceId) {
    return res.status(400).json({ error: "invalid_plan_or_interval" });
  }

  const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";

  // Parametri comuni
  const params: Record<string, string | number> = {
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "success_url": `${appUrl}/?abbonato=true`,
    "cancel_url":  `${appUrl}/subscribe`,
    "metadata[societyId]": String(societyId),
    "metadata[piano]":     String(piano),
    "metadata[intervallo]":String(intervallo),
  };

  // Pre-fill email se disponibile
  if (email) params["customer_email"] = String(email);

  // Piano annuale: ancora al 1° agosto + proration automatica di Stripe
  if (String(intervallo) === "annuale") {
    params["subscription_data[billing_cycle_anchor]"] = nextAugFirst();
    // proration_behavior default = create_prorations — Stripe calcola il pro-rata in giorni
    // automaticamente sulla prima fattura (da oggi fino al 1° agosto)
  }

  try {
    const session = await stripePost("/checkout/sessions", params);
    logger.info({ societyId, piano, intervallo }, "stripe checkout session created");
    return res.json({ url: session.url });
  } catch (e: any) {
    logger.error({ err: e }, "stripe create-checkout error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});

// POST /api/v2/stripe/webhook
router.post("/stripe/webhook", async (req, res) => {
  const sig    = req.headers["stripe-signature"] as string | undefined;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn("STRIPE_WEBHOOK_SECRET not set — webhook skipped");
    return res.sendStatus(200);
  }

  const rawBody: Buffer | undefined = (req as any).rawBody;
  if (!sig || !rawBody) {
    return res.status(400).json({ error: "missing_signature" });
  }

  // Verifica firma Stripe (t=timestamp,v1=hash)
  const parts     = Object.fromEntries(sig.split(",").map(p => p.split("=")));
  const timestamp = parts["t"];
  const v1        = parts["v1"];
  if (!timestamp || !v1) {
    return res.status(400).json({ error: "invalid_signature_format" });
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return res.status(400).json({ error: "stale_event" });
  }

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected      = createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuf   = Buffer.from(expected, "hex");
  const receivedBuf   = Buffer.from(v1, "hex");

  if (expectedBuf.length !== receivedBuf.length || !timingSafeEqual(expectedBuf, receivedBuf)) {
    logger.warn({ sig }, "stripe webhook signature mismatch");
    return res.status(400).json({ error: "invalid_signature" });
  }

  const event = req.body as any;
  logger.info({ type: event?.type }, "stripe webhook received");

  if (event?.type === "checkout.session.completed") {
    const session    = event.data?.object;
    const societyId  = session?.metadata?.societyId;
    const customerId = session?.customer;
    const subId      = session?.subscription;

    if (societyId && customerId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status      = 'active',
               stripe_customer_id       = ?,
               stripe_subscription_id   = ?
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
