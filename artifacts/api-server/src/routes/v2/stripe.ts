import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { sendCancelledEmail, sendPaymentFailedEmail } from "../../lib/email";

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

// Restituisce il timestamp Unix di agosto 1, 2026 solo durante il pre-lancio (1 giu – 31 lug 2026).
// In tutti gli altri periodi restituisce null → Stripe usa il ciclo standard (1 anno da oggi).
function getPreLaunchAnchorTs(): number | null {
  const nowMs  = Date.now();
  const jun2026 = Date.UTC(2026, 5, 1); // 1 giugno 2026
  const aug2026 = Date.UTC(2026, 7, 1); // 1 agosto 2026
  if (nowMs >= jun2026 && nowMs < aug2026) return Math.floor(aug2026 / 1000);
  return null;
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

async function getSocietyBillingMode(
  subId: string | null,
  customerId: string | null,
  societyId: number | null
): Promise<'stripe' | 'omaggio'> {
  try {
    let q: string, p: any[];
    if (societyId != null) { q = "SELECT billing_mode FROM societies WHERE id = ?"; p = [societyId]; }
    else if (subId)        { q = "SELECT billing_mode FROM societies WHERE stripe_subscription_id = ?"; p = [subId]; }
    else if (customerId)   { q = "SELECT billing_mode FROM societies WHERE stripe_customer_id = ?"; p = [customerId]; }
    else return 'stripe';
    const [rows] = await pool.execute(q, p) as [any[], any];
    return (rows[0]?.billing_mode as 'stripe' | 'omaggio') ?? 'stripe';
  } catch {
    return 'stripe'; // fail-safe: default to stripe behavior
  }
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
// IDs demo/locali che non sono presenti nel DB MySQL reale
const DEMO_SOC_IDS = new Set([0, 99, 99999]);

router.post("/stripe/create-checkout", async (req, res) => {
  const { piano, intervallo, societyId: rawSocietyId, email } = req.body as Record<string, string | number | undefined>;

  if (!piano || !intervallo) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!email) {
    return res.status(400).json({ error: "missing_email", detail: "Accedi prima di procedere al pagamento." });
  }

  // Blocca piano annuale in giugno e luglio, eccetto durante il pre-lancio 2026
  if (String(intervallo) === "annuale") {
    const month = new Date().getUTCMonth();
    if (PRORATA_PCT[month] === null && !getPreLaunchAnchorTs()) {
      return res.status(400).json({
        error: "annual_not_available",
        detail: "Il piano annuale non è disponibile in giugno e luglio. Usa il piano mensile.",
      });
    }
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // societyId: valido solo se non è un ID demo/locale
  let societyId: number | null =
    rawSocietyId && !DEMO_SOC_IDS.has(Number(rawSocietyId)) ? Number(rawSocietyId) : null;

  let stripeCustomerId: string | null = null;
  let userId: number | null = null;

  // Lookup utente in MySQL — risolve society, customer Stripe e userId
  try {
    const [userRows] = (await pool.execute(
      `SELECT u.id, u.society_id, u.stripe_customer_id,
              s.stripe_customer_id AS soc_stripe_customer_id
       FROM users u
       LEFT JOIN societies s ON s.id = u.society_id
       WHERE LOWER(u.email) = ? LIMIT 1`,
      [normalizedEmail]
    )) as [any[], any];

    if (userRows.length) {
      const u = userRows[0];
      userId = u.id;
      // Usa stripe_customer_id dall'utente o dalla sua società (fallback)
      stripeCustomerId = u.stripe_customer_id || u.soc_stripe_customer_id || null;
      // Risolvi societyId dal DB se non già impostato e non è un ID demo
      if (!societyId && u.society_id && !DEMO_SOC_IDS.has(u.society_id)) {
        societyId = u.society_id;
      }
    }
  } catch (e: any) {
    logger.error({ err: e }, "stripe: user lookup failed");
  }

  // Crea Stripe customer se non esiste ancora
  if (!stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const custParams: Record<string, string | number> = { email: normalizedEmail };
      if (userId)    custParams["metadata[userId]"]    = String(userId);
      if (societyId) custParams["metadata[societyId]"] = String(societyId);
      const customer = await stripePost("/customers", custParams);
      stripeCustomerId = customer.id;
      // Salva il customer su users (se l'utente esiste in MySQL)
      if (userId && stripeCustomerId) {
        pool.execute(
          "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
          [stripeCustomerId, userId]
        ).catch((e: any) => logger.warn({ err: e }, "stripe: save stripe_customer_id on users failed"));
      }
    } catch (e: any) {
      logger.warn({ err: e }, "stripe: create customer failed — proceeding without customer");
    }
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
    "metadata[piano]":     String(piano),
    "metadata[intervallo]": String(intervallo),
    "metadata[email]":     normalizedEmail,
  };

  // Customer Stripe: usa il customer se disponibile, altrimenti customer_email
  if (stripeCustomerId) {
    params["customer"] = stripeCustomerId;
  } else {
    params["customer_email"] = normalizedEmail;
  }

  // societyId nei metadata solo se valido (webhook può aggiornare la società)
  if (societyId) {
    params["metadata[societyId]"] = String(societyId);
  }

  // Pre-lancio (giu-lug 2026): ancora il ciclo al 1° agosto 2026, trial fino ad allora.
  // Stagione normale e test pre-lancio: nessun anchor, Stripe usa 1 anno da oggi.
  if (String(intervallo) === "annuale") {
    const anchorTs = getPreLaunchAnchorTs();
    if (anchorTs) {
      params["subscription_data[billing_cycle_anchor]"] = anchorTs;
      params["subscription_data[trial_end]"]            = anchorTs;
    }
  }

  params["allow_promotion_codes"] = "true";

  try {
    const session = await stripePost("/checkout/sessions", params);
    logger.info({ societyId, piano, intervallo, userId, hasCustomer: !!stripeCustomerId }, "stripe checkout session created");
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
      const billingMode = await getSocietyBillingMode(null, null, Number(societyId));

      try {
        if (billingMode === 'omaggio') {
          // Salva solo gli ID Stripe, non toccare il piano
          await pool.execute(
            `UPDATE societies
             SET subscription_status    = 'active',
                 stripe_customer_id     = ?,
                 stripe_subscription_id = ?
             WHERE id = ?`,
            [customerId, subId ?? null, Number(societyId)]
          );
          logger.warn({ societyId, billingMode }, "stripe: omaggio society — piano not updated on checkout");
        } else {
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
        }
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on checkout.session.completed");
      }

      // Update SA blob so login is unblocked even if client never saw /payment-success
      if (piano && piano !== "demo" && billingMode !== 'omaggio') {
        try {
          const SA_KEY = "fieldos_sa_v1";
          const [stateRows] = await pool.execute(
            "SELECT state_json FROM society_state WHERE `key` = ?",
            [SA_KEY]
          ) as [any[], any];

          if (stateRows.length) {
            const saState = JSON.parse(stateRows[0].state_json);
            const soc = (saState.saSocieties as any[])?.find((s: any) => s.id === Number(societyId));
            if (soc) {
              soc.piano        = piano;
              soc.scadenzaDemo = null;
              await pool.execute(
                "UPDATE society_state SET state_json = ? WHERE `key` = ?",
                [JSON.stringify(saState), SA_KEY]
              );
              logger.info({ societyId, piano }, "stripe: SA blob updated after checkout");
            }
          }
        } catch (e: any) {
          logger.error({ err: e }, "stripe: SA blob update failed (non-blocking)");
        }
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
      const billingMode = await getSocietyBillingMode(subId, null, null);
      const dbStatus = status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
      try {
        if (billingMode === 'omaggio') {
          await pool.execute(
            `UPDATE societies SET subscription_status = ? WHERE stripe_subscription_id = ?`,
            [dbStatus, subId]
          );
          logger.warn({ subId, billingMode }, "stripe: omaggio society — piano not updated on subscription.updated");
        } else {
          await pool.execute(
            `UPDATE societies
             SET subscription_status = ?,
                 piano               = COALESCE(?, piano)
             WHERE stripe_subscription_id = ?`,
            [dbStatus, piano ?? null, subId]
          );
          logger.info({ subId, piano, status }, "stripe: subscription updated");
        }
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.updated");
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────────────────
  if (event?.type === "customer.subscription.deleted") {
    const sub        = event.data?.object;
    const subId      = sub?.id;
    const canceledAt = sub?.canceled_at ? new Date((sub.canceled_at as number) * 1000) : new Date();

    if (subId) {
      const billingMode = await getSocietyBillingMode(subId, null, null);

      // 1. Update MySQL: subscription_status + sospensione società (solo se stripe)
      let societyId: number | null = null;
      let ownerEmail: string | null = null;
      let ownerNome: string | null = null;
      let ownerCognome: string | null = null;
      let societyNome: string | null = null;

      try {
        if (billingMode === 'omaggio') {
          await pool.execute(
            `UPDATE societies SET subscription_status = 'canceled' WHERE stripe_subscription_id = ?`,
            [subId]
          );
          logger.warn({ subId, billingMode }, "stripe: omaggio society — not suspended on subscription.deleted");
        } else {
          await pool.execute(
            `UPDATE societies
             SET subscription_status = 'canceled',
                 stato               = 'sospesa',
                 suspended_at        = NOW(),
                 suspended_reason    = 'Stripe subscription cancelled'
             WHERE stripe_subscription_id = ?`,
            [subId]
          );
          logger.info({ subId }, "stripe: subscription canceled, society suspended");
        }

        // Recupera info società per blob, audit, email
        const [rows] = await pool.execute(
          `SELECT s.id, s.nome, u.email, u.nome AS owner_nome, u.cognome AS owner_cognome
           FROM societies s
           LEFT JOIN users u ON u.society_id = s.id AND u.ruolo = 'admin' AND u.stato = 'attivo'
           WHERE s.stripe_subscription_id = ?
           LIMIT 1`,
          [subId]
        ) as [any[], any];

        if (rows.length) {
          societyId    = rows[0].id;
          societyNome  = rows[0].nome;
          ownerEmail   = rows[0].email;
          ownerNome    = rows[0].owner_nome;
          ownerCognome = rows[0].owner_cognome;
        }
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.deleted");
      }

      // 2. Aggiorna blob SA — solo per billing_mode stripe
      if (societyId && billingMode !== 'omaggio') {
        try {
          const SA_KEY = "fieldos_sa_v1";
          const [stateRows] = await pool.execute(
            "SELECT state_json FROM society_state WHERE `key` = ?",
            [SA_KEY]
          ) as [any[], any];

          if (stateRows.length) {
            const saState = JSON.parse(stateRows[0].state_json);
            const soc = (saState.saSocieties as any[])?.find((s: any) => s.id === societyId);
            if (soc) {
              soc.stato = "sospeso";
              await pool.execute(
                "UPDATE society_state SET state_json = ? WHERE `key` = ?",
                [JSON.stringify(saState), SA_KEY]
              );
              logger.info({ societyId, subId }, "stripe: SA blob updated - society suspended");
            }
          }
        } catch (e: any) {
          logger.error({ err: e }, "stripe: SA blob update failed on subscription.deleted");
        }
      }

      // 3. Audit log — sempre, indipendentemente da billing_mode
      if (societyId) {
        try {
          await pool.execute(
            `INSERT INTO sa_audit_log
               (action, target_society_id, target_email, performed_by, reason, metadata, created_at)
             VALUES
               ('auto_suspended_payment_canceled', ?, ?, 'SYSTEM_STRIPE_WEBHOOK',
                'Subscription cancelled by Stripe (payment failed or manual cancel)',
                ?, NOW())`,
            [
              societyId,
              ownerEmail ?? null,
              JSON.stringify({
                stripe_subscription_id: subId,
                stripe_event_id:        event.id ?? null,
                canceled_at:            canceledAt.toISOString(),
                billing_mode:           billingMode,
              }),
            ]
          );
          logger.info({ societyId, subId, billingMode }, "stripe: audit log inserted for subscription.deleted");
        } catch (e: any) {
          logger.error({ err: e }, "stripe: audit log insert failed on subscription.deleted");
        }

        // 4. Email owner — solo per billing_mode stripe
        if (ownerEmail && billingMode !== 'omaggio') {
          sendCancelledEmail({
            email:       ownerEmail,
            nome:        ownerNome    ?? "",
            cognome:     ownerCognome ?? "",
            nomeSocieta: societyNome  ?? "",
          }).catch((e: any) => logger.error({ err: e }, "stripe: cancellation email failed"));
        }
      }
    }
  }

  // ── invoice.payment_failed ───────────────────────────────────────────────
  if (event?.type === "invoice.payment_failed") {
    const invoice      = event.data?.object;
    const subId        = invoice?.subscription;
    const customerId   = invoice?.customer;
    const invoiceId    = invoice?.id;
    const attemptCount = invoice?.attempt_count ?? 1;
    const nextAttempt  = invoice?.next_payment_attempt ?? null; // Unix ts or null

    if (subId || customerId) {
      const billingMode = await getSocietyBillingMode(subId ?? null, customerId ?? null, null);
      if (billingMode === 'omaggio') {
        logger.warn({ subId, customerId }, "stripe: invoice.payment_failed ignored for omaggio society");
      } else {
      let societyId: number | null = null;
      let ownerEmail: string | null = null;
      let ownerNome: string | null = null;
      let ownerCognome: string | null = null;
      let societyNome: string | null = null;

      // 1. Aggiorna MySQL subscription_status='past_due' + payment_failed_at
      try {
        const whereClause = subId
          ? "stripe_subscription_id = ?"
          : "stripe_customer_id = ?";
        const whereVal = subId ?? customerId;

        await pool.execute(
          `UPDATE societies
           SET subscription_status = 'past_due',
               payment_failed_at   = NOW()
           WHERE ${whereClause}`,
          [whereVal]
        );
        logger.info({ subId, customerId, attemptCount }, "stripe: payment failed, society past_due");

        // Recupera info società
        const [rows] = await pool.execute(
          `SELECT s.id, s.nome, u.email, u.nome AS owner_nome, u.cognome AS owner_cognome
           FROM societies s
           LEFT JOIN users u ON u.society_id = s.id AND u.ruolo = 'admin' AND u.stato = 'attivo'
           WHERE ${whereClause}
           LIMIT 1`,
          [whereVal]
        ) as [any[], any];

        if (rows.length) {
          societyId    = rows[0].id;
          societyNome  = rows[0].nome;
          ownerEmail   = rows[0].email;
          ownerNome    = rows[0].owner_nome;
          ownerCognome = rows[0].owner_cognome;
        }
      } catch (e: any) {
        logger.error({ err: e }, "stripe: DB update failed on invoice.payment_failed");
      }

      // 2. Aggiorna blob SA: soc.paymentStatus='past_due' — riusa pattern Fix 3/Fix 1
      if (societyId) {
        try {
          const SA_KEY = "fieldos_sa_v1";
          const [stateRows] = await pool.execute(
            "SELECT state_json FROM society_state WHERE `key` = ?",
            [SA_KEY]
          ) as [any[], any];

          if (stateRows.length) {
            const saState = JSON.parse(stateRows[0].state_json);
            const soc = (saState.saSocieties as any[])?.find((s: any) => s.id === societyId);
            if (soc) {
              soc.paymentStatus = "past_due";
              await pool.execute(
                "UPDATE society_state SET state_json = ? WHERE `key` = ?",
                [JSON.stringify(saState), SA_KEY]
              );
              logger.info({ societyId, attemptCount }, "stripe: SA blob updated - paymentStatus=past_due");
            }
          }
        } catch (e: any) {
          logger.error({ err: e }, "stripe: SA blob update failed on invoice.payment_failed");
        }

        // 3. Audit log
        try {
          await pool.execute(
            `INSERT INTO sa_audit_log
               (action, target_society_id, target_email, performed_by, reason, metadata, created_at)
             VALUES
               ('payment_failed_warning', ?, ?, 'SYSTEM_STRIPE_WEBHOOK',
                'Stripe invoice.payment_failed',
                ?, NOW())`,
            [
              societyId,
              ownerEmail ?? null,
              JSON.stringify({
                stripe_invoice_id:       invoiceId    ?? null,
                stripe_subscription_id:  subId        ?? null,
                stripe_event_id:         event.id     ?? null,
                attempt_count:           attemptCount,
                next_payment_attempt:    nextAttempt,
              }),
            ]
          );
          logger.info({ societyId, attemptCount }, "stripe: audit log inserted for payment_failed");
        } catch (e: any) {
          logger.error({ err: e }, "stripe: audit log insert failed on invoice.payment_failed");
        }

        // 4. Email warning — non bloccante
        if (ownerEmail) {
          sendPaymentFailedEmail({
            email:        ownerEmail,
            nome:         ownerNome    ?? "",
            cognome:      ownerCognome ?? "",
            nomeSocieta:  societyNome  ?? "",
            attemptCount,
            nextAttempt,
          }).catch((e: any) => logger.error({ err: e }, "stripe: payment failed email failed"));
        }
      }
      } // end else (billingMode !== 'omaggio')
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
      `SELECT subscription_status, piano, stripe_subscription_id, stripe_customer_id, demo_scadenza, billing_mode
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
      billingMode:       soc.billing_mode ?? 'stripe',
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
