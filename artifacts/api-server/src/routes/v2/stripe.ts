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
function nextAugFirst(): number {
  const now = new Date();
  const month = now.getUTCMonth();
  const day   = now.getUTCDate();
  const isToday = month === 7 && day === 1;
  const anchorYear = (month >= 7 && !isToday)
    ? now.getUTCFullYear() + 1
    : (month < 7)
      ? now.getUTCFullYear()
      : now.getUTCFullYear() + 1;
  return Math.floor(Date.UTC(anchorYear, 7, 1) / 1000);
}

function getPriceId(piano: string, intervallo: string): string | null {
  return process.env[PRICE_ENV[piano]?.[intervallo] ?? ""] || null;
}

// Reverse lookup: Stripe price ID → piano name (mister / mister_pro / societa)
function priceIdToPiano(priceId: string): string | null {
  for (const [piano, intervals] of Object.entries(PRICE_ENV)) {
    for (const envVar of Object.values(intervals)) {
      if (process.env[envVar] === priceId) return piano;
    }
  }
  return null;
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

async function stripeGet(path: string): Promise<any> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await resp.json() as any;
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}

// POST /api/v2/stripe/create-checkout
router.post("/stripe/create-checkout", async (req, res) => {
  const { piano, intervallo, societyId: rawSocietyId, email } = req.body as Record<string, string | number | undefined>;

  if (!piano || !intervallo) {
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

  // Risolvi societyId: dal payload oppure tramite lookup email in MySQL
  let societyId: number | null = rawSocietyId ? Number(rawSocietyId) : null;

  if (!societyId && email) {
    try {
      const [rows] = (await pool.execute(
        "SELECT society_id FROM users WHERE LOWER(email) = ? LIMIT 1",
        [String(email).trim().toLowerCase()]
      )) as [any[], any];
      if (rows.length) societyId = rows[0].society_id;
    } catch (e: any) {
      logger.error({ err: e }, "stripe: email→society lookup failed");
    }
  }

  if (!societyId) {
    return res.status(400).json({
      error: "society_not_found",
      detail: "Nessuna società trovata. Completa la registrazione prima di procedere.",
    });
  }

  const priceId = getPriceId(String(piano), String(intervallo));
  if (!priceId) {
    return res.status(400).json({ error: "invalid_plan_or_interval" });
  }

  const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";

  const params: Record<string, string | number> = {
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "success_url": `${appUrl}/payment-success?piano=${encodeURIComponent(String(piano))}&intervallo=${encodeURIComponent(String(intervallo))}`,
    "cancel_url":  `${appUrl}/subscribe`,
    "metadata[societyId]": String(societyId),
    "metadata[piano]":     String(piano),
    "metadata[intervallo]": String(intervallo),
  };

  if (email) params["customer_email"] = String(email);

  if (String(intervallo) === "annuale") {
    params["subscription_data[billing_cycle_anchor]"] = nextAugFirst();
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

  // ── checkout.session.completed ──────────────────────────────────────────
  if (event?.type === "checkout.session.completed") {
    const session    = event.data?.object;
    const societyId  = session?.metadata?.societyId;
    const piano      = session?.metadata?.piano;
    const customerId = session?.customer;
    const subId      = session?.subscription;

    if (societyId && customerId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status    = 'active',
               piano                  = COALESCE(?, piano),
               stripe_customer_id     = ?,
               stripe_subscription_id = ?
           WHERE id = ?`,
          [piano ?? null, customerId, subId ?? null, Number(societyId)]
        );
        logger.info({ societyId, customerId, piano }, "stripe: society activated");
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on checkout.session.completed");
      }
    }
  }

  // ── customer.subscription.updated ───────────────────────────────────────
  if (event?.type === "customer.subscription.updated") {
    const sub     = event.data?.object;
    const subId   = sub?.id;
    const priceId = sub?.items?.data?.[0]?.price?.id;
    const piano   = priceId ? priceIdToPiano(priceId) : null;
    const status  = sub?.status; // active, past_due, canceled, etc.

    if (subId) {
      try {
        const dbStatus = status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
        await pool.execute(
          `UPDATE societies
           SET subscription_status = ?,
               piano               = COALESCE(?, piano)
           WHERE stripe_subscription_id = ?`,
          [dbStatus, piano ?? null, subId]
        );
        logger.info({ subId, piano, status }, "stripe: subscription updated");
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.updated");
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────────────────
  if (event?.type === "customer.subscription.deleted") {
    const sub   = event.data?.object;
    const subId = sub?.id;

    if (subId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status = 'canceled'
           WHERE stripe_subscription_id = ?`,
          [subId]
        );
        logger.info({ subId }, "stripe: subscription canceled");
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.deleted");
      }
    }
  }

  return res.sendStatus(200);
});

// GET /api/v2/stripe/subscription?societyId=X
router.get("/stripe/subscription", async (req, res) => {
  const societyId = req.query.societyId;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });

  try {
    const [rows] = await pool.execute(
      `SELECT subscription_status, piano, stripe_subscription_id, stripe_customer_id, demo_scadenza
       FROM societies WHERE id = ?`,
      [Number(societyId)]
    ) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "society_not_found" });
    const soc = rows[0];

    let currentPeriodEnd: number | null = null;
    let cancelAtPeriodEnd: boolean | null = null;
    let intervallo: string | null = null;

    let paymentMethod: { brand: string; last4: string } | null = null;

    if (soc.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const sub = await stripeGet(
          `/subscriptions/${soc.stripe_subscription_id}?expand[]=default_payment_method`
        );
        currentPeriodEnd  = sub.current_period_end   ?? null;
        cancelAtPeriodEnd = sub.cancel_at_period_end ?? null;
        const priceId     = sub.items?.data?.[0]?.price?.id;
        if (priceId) {
          for (const [, intervals] of Object.entries(PRICE_ENV)) {
            if (process.env[intervals.mensile] === priceId)  { intervallo = "mensile";  break; }
            if (process.env[intervals.annuale] === priceId)  { intervallo = "annuale";  break; }
          }
        }
        const pm = sub.default_payment_method;
        if (pm?.card) paymentMethod = { brand: pm.card.brand, last4: pm.card.last4 };
      } catch { /* Stripe unreachable — return DB data only */ }
    }

    return res.json({
      status:            soc.subscription_status,
      piano:             soc.piano,
      demoScadenza:      soc.demo_scadenza,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      intervallo,
      paymentMethod,
    });
  } catch (e: any) {
    logger.error({ err: e }, "stripe: subscription fetch error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/stripe/customer-portal
router.post("/stripe/customer-portal", async (req, res) => {
  const { societyId } = req.body as Record<string, string | undefined>;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });

  try {
    const [rows] = await pool.execute(
      `SELECT stripe_customer_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    ) as [any[], any];

    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return res.status(400).json({ error: "no_stripe_customer" });

    const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
    const session = await stripePost("/billing_portal/sessions", {
      customer:   customerId,
      return_url: `${appUrl}/account`,
    });

    logger.info({ societyId }, "stripe: customer portal session created");
    return res.json({ url: session.url });
  } catch (e: any) {
    logger.error({ err: e }, "stripe: customer-portal error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});

// POST /api/v2/stripe/cancel
router.post("/stripe/cancel", async (req, res) => {
  const { societyId, motivo, dettaglio } = req.body as Record<string, string | undefined>;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });

  try {
    const [rows] = await pool.execute(
      `SELECT stripe_subscription_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    ) as [any[], any];

    const subId = rows[0]?.stripe_subscription_id;
    if (!subId) return res.status(400).json({ error: "no_subscription" });

    await stripePost(`/subscriptions/${subId}`, { cancel_at_period_end: "true" });

    if (motivo) {
      await pool.execute(
        `INSERT INTO churn_feedback (society_id, motivo, dettaglio) VALUES (?, ?, ?)`,
        [Number(societyId), motivo, dettaglio || null]
      ).catch((e: any) => logger.warn({ err: e }, "churn_feedback insert failed"));
    }

    logger.info({ societyId, subId, motivo }, "stripe: subscription cancel_at_period_end set");
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "stripe: cancel error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});

// GET /api/v2/stripe/invoices?societyId=X
router.get("/stripe/invoices", async (req, res) => {
  const societyId = req.query.societyId;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });

  try {
    const [rows] = await pool.execute(
      `SELECT stripe_customer_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    ) as [any[], any];

    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId || !process.env.STRIPE_SECRET_KEY) return res.json({ invoices: [] });

    const data = await stripeGet(`/invoices?customer=${customerId}&limit=24`);
    const invoices = (data.data || []).map((inv: any) => ({
      id:         inv.id,
      number:     inv.number,
      amount:     inv.amount_paid / 100,
      currency:   inv.currency?.toUpperCase() ?? "EUR",
      status:     inv.status,
      date:       inv.created,
      pdfUrl:     inv.invoice_pdf     ?? null,
      hostedUrl:  inv.hosted_invoice_url ?? null,
    }));
    return res.json({ invoices });
  } catch (e: any) {
    logger.error({ err: e }, "stripe: invoices fetch error");
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
