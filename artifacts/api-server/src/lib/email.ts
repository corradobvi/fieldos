import nodemailer from "nodemailer";
import { logger } from "./logger";

const FROM     = '"MyVivaio" <info@myvivaio.app>';
const ADMIN_TO = "info@myvivaio.app";

function _transport() {
  return nodemailer.createTransport({
    host:           process.env.SMTP_HOST ?? "smtps.aruba.it",
    port:           parseInt(process.env.SMTP_PORT ?? "465"),
    secure:         process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    socketTimeout:     10_000,
    greetingTimeout:   10_000,
  } as any);
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn("SMTP credentials not set — email skipped");
    return;
  }
  const t = _transport();
  await t.sendMail({ from: FROM, replyTo: ADMIN_TO, to, subject, html });
}

export async function sendWelcomeEmails(opts: {
  nome: string;
  cognome: string;
  email: string;
  phone: string;
  nomeSocieta: string;
  citta?: string;
  piano: string;
  demoExpires: Date;
  societyId?: number;
}): Promise<void> {
  const { nome, cognome, email, phone, nomeSocieta, citta, piano, demoExpires, societyId } = opts;

  const pianoLabel = piano === "mister" ? "Mister" : piano === "mister_pro" ? "Mister Pro" : "Società";
  const dataReg    = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const waNum      = phone.replace(/\D/g, "");
  const waLink     = waNum ? `https://wa.me/${waNum}` : null;
  const waDisplay  = phone ? phone.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4") : "—";
  const saLink     = societyId ? `https://app.myvivaio.app/superadmin?societyId=${societyId}` : "https://app.myvivaio.app/superadmin";

  const html = `
<div style="font-family:sans-serif;max-width:520px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">🎉 Nuovo cliente MyVivaio: ${nomeSocieta} (${pianoLabel})</h2>
  <p style="color:#64748b;font-size:.85rem;margin-top:0;">Self-register completato il ${dataReg}</p>
  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;white-space:nowrap;">Nome</td>
      <td style="padding:8px 0;font-weight:700;">${nome} ${cognome}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Email</td>
      <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1A7A4A;">${email}</a></td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Telefono / WhatsApp</td>
      <td style="padding:8px 0;">${waLink ? `<a href="${waLink}" style="color:#1A7A4A;font-weight:700;">${waDisplay}</a>` : "—"}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Società</td>
      <td style="padding:8px 0;font-weight:700;">${nomeSocieta}${citta ? ` — ${citta}` : ""}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Piano</td>
      <td style="padding:8px 0;">${pianoLabel}</td>
    </tr>
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Demo scade</td>
      <td style="padding:8px 0;">${demoExpires.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</td>
    </tr>
  </table>
  <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
    ${waLink ? `<a href="${waLink}" style="background:#25d366;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem;">💬 Apri WhatsApp</a>` : ""}
    <a href="${saLink}" style="background:#1A7A4A;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem;">🏢 Apri in SuperAdmin</a>
  </div>
  <p style="margin-top:20px;background:#fef9c3;border-left:3px solid #eab308;padding:10px 14px;font-size:.85rem;border-radius:0 6px 6px 0;">
    ⚠️ <strong>Aggiungi il contatto manualmente in Superchat</strong> per attivare il funnel WhatsApp.
  </p>
</div>`;

  try {
    await sendMail(
      ADMIN_TO,
      `🎉 Nuovo cliente MyVivaio: ${nomeSocieta} (${pianoLabel})`,
      html
    );
    logger.info({ email, societyId }, "welcome admin notification sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "welcome email failed (non-blocking)");
  }
}

export async function sendPasswordResetEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
  tempPass: string;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta, tempPass } = opts;
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">🔑 Nuova password — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>Il tuo accesso a <strong>${nomeSocieta}</strong> è stato resettato dall'amministratore di sistema.</p>
  <p style="margin:20px 0 8px;">La tua password temporanea è:</p>
  <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;padding:18px;text-align:center;margin:0 0 16px;">
    <code style="font-size:1.5rem;font-weight:800;letter-spacing:4px;color:#065f46;">${tempPass}</code>
  </div>
  <p style="font-size:.85rem;color:#64748b;">
    Accedi su <a href="https://myvivaio.app" style="color:#1A7A4A;font-weight:600;">myvivaio.app</a> con questa password temporanea.
    Verrai reindirizzato a cambiarla subito.
  </p>
  <p style="font-size:.75rem;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
    Se non hai richiesto questo reset, contatta l'assistenza MyVivaio.
  </p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Nuova password temporanea — ${nomeSocieta}`, html);
    logger.info({ email }, "password reset email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "password reset email failed (non-blocking)");
  }
}

export async function sendSuspendEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
  reason?: string;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta, reason } = opts;
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#dc2626;margin-bottom:4px;">⚠️ Account sospeso — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>L'accesso a <strong>${nomeSocieta}</strong> su MyVivaio è stato temporaneamente sospeso dall'amministratore di sistema.</p>
  ${reason ? `<p style="background:#fef2f2;border-left:3px solid #dc2626;padding:8px 12px;font-size:.87rem;color:#7f1d1d;">Motivo: ${reason}</p>` : ""}
  <p style="font-size:.85rem;color:#64748b;">
    Per richiedere la riattivazione o per maggiori informazioni, contatta il supporto MyVivaio:<br>
    <a href="mailto:info@myvivaio.app" style="color:#1A7A4A;font-weight:600;">info@myvivaio.app</a>
  </p>
  <p style="font-size:.75rem;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
    I tuoi dati (giocatori, allenamenti, presenze) sono conservati e saranno disponibili alla riattivazione.
  </p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Account ${nomeSocieta} sospeso`, html);
    logger.info({ email }, "suspend email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "suspend email failed (non-blocking)");
  }
}

export async function sendReactivateEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta } = opts;
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">✅ Account riattivato — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>Ottima notizia! Il tuo accesso a <strong>${nomeSocieta}</strong> su MyVivaio è stato riattivato.</p>
  <p style="margin:20px 0;">
    <a href="https://myvivaio.app" style="background:#1A7A4A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">▶ Accedi a MyVivaio</a>
  </p>
  <p style="font-size:.85rem;color:#64748b;">Tutti i tuoi dati sono esattamente come li hai lasciati.</p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Account ${nomeSocieta} riattivato`, html);
    logger.info({ email }, "reactivate email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "reactivate email failed (non-blocking)");
  }
}

export async function sendDemoExtendedEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
  days: number;
  newExpiresAt: Date;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta, days, newExpiresAt } = opts;
  const dataScad = newExpiresAt.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">🎉 Demo estesa — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>Buone notizie! La tua demo di <strong>${nomeSocieta}</strong> è stata estesa di <strong>${days} giorni</strong>.</p>
  <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin:16px 0;text-align:center;">
    <div style="font-size:.82rem;color:#64748b;margin-bottom:4px;">Nuova scadenza demo</div>
    <div style="font-size:1.2rem;font-weight:800;color:#065f46;">${dataScad}</div>
  </div>
  <p style="font-size:.85rem;color:#64748b;">
    Continua ad esplorare tutte le funzionalità. Per qualsiasi domanda siamo qui:<br>
    <a href="mailto:info@myvivaio.app" style="color:#1A7A4A;font-weight:600;">info@myvivaio.app</a>
  </p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Demo ${nomeSocieta} estesa di ${days} giorni`, html);
    logger.info({ email }, "demo extended email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "demo extended email failed (non-blocking)");
  }
}

export async function sendPaymentFailedEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
  attemptCount: number;
  nextAttempt: number | null;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta, attemptCount, nextAttempt } = opts;
  const waText  = encodeURIComponent(`Ciao Vivi, ho un problema con il pagamento di MyVivaio per ${nomeSocieta}. Puoi aiutarmi?`);
  const waLink  = `https://wa.me/393793827922?text=${waText}`;
  const nextStr = nextAttempt
    ? `<p style="font-size:.87rem;color:#64748b;">Prossimo tentativo automatico: <strong>${new Date(nextAttempt * 1000).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</strong></p>`
    : `<p style="font-size:.87rem;color:#dc2626;font-weight:600;">Questo era l'ultimo tentativo. L'abbonamento potrebbe essere cancellato.</p>`;
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#d97706;margin-bottom:4px;">⚠️ Pagamento non riuscito — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>Il pagamento del tuo abbonamento <strong>${nomeSocieta}</strong> non è andato a buon fine (tentativo ${attemptCount}).</p>
  ${nextStr}
  <p style="margin:16px 0 8px;font-weight:600;">Cosa puoi fare:</p>
  <ul style="padding-left:18px;font-size:.9rem;line-height:1.7;">
    <li>Verifica che la tua carta sia valida e abbia fondi disponibili</li>
    <li>Aggiorna il metodo di pagamento dalla sezione <strong>Account → Piano</strong></li>
    <li>Contatta Vivi su WhatsApp per assistenza immediata</li>
  </ul>
  <p style="margin-top:20px;">
    <a href="${waLink}" style="background:#25d366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">💬 Scrivi a Vivi su WhatsApp</a>
  </p>
  <p style="font-size:.85rem;color:#64748b;margin-top:16px;">
    Oppure aggiorna il pagamento su <a href="https://myvivaio.app" style="color:#1A7A4A;font-weight:600;">myvivaio.app</a> → Account → Piano.
  </p>
  <p style="font-size:.75rem;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
    I tuoi dati sono al sicuro. Regolarizzando il pagamento l'accesso sarà ripristinato immediatamente.
  </p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Pagamento non riuscito — ${nomeSocieta} (tentativo ${attemptCount})`, html);
    logger.info({ email, attemptCount }, "payment failed warning email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "payment failed warning email failed (non-blocking)");
  }
}

export async function sendCancelledEmail(opts: {
  email: string;
  nome: string;
  cognome: string;
  nomeSocieta: string;
}): Promise<void> {
  const { email, nome, cognome, nomeSocieta } = opts;
  const waText = encodeURIComponent(`Ciao Vivi, il mio abbonamento MyVivaio è stato cancellato e vorrei riattivarlo. Società: ${nomeSocieta}`);
  const waLink = `https://wa.me/393793827922?text=${waText}`;
  const html = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#dc2626;margin-bottom:4px;">❌ Abbonamento cancellato — MyVivaio</h2>
  <p>Ciao <strong>${nome} ${cognome}</strong>,</p>
  <p>Il tuo abbonamento a <strong>${nomeSocieta}</strong> su MyVivaio è stato cancellato e l'accesso all'app è stato sospeso.</p>
  <p style="background:#fef2f2;border-left:3px solid #dc2626;padding:8px 12px;font-size:.87rem;color:#7f1d1d;">
    Se non hai richiesto tu la cancellazione, contattaci subito — i tuoi dati sono al sicuro e puoi riattivarti rapidamente.
  </p>
  <p style="margin-top:20px;">
    <a href="${waLink}" style="background:#25d366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">💬 Scrivi a Vivi su WhatsApp</a>
  </p>
  <p style="font-size:.85rem;color:#64748b;margin-top:16px;">
    Oppure scrivici a <a href="mailto:info@myvivaio.app" style="color:#1A7A4A;font-weight:600;">info@myvivaio.app</a>
  </p>
  <p style="font-size:.75rem;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">
    I tuoi dati (giocatori, allenamenti, presenze) sono conservati e saranno disponibili alla riattivazione.
  </p>
</div>`;
  try {
    await sendMail(email, `[MyVivaio] Abbonamento ${nomeSocieta} cancellato`, html);
    logger.info({ email }, "cancellation email sent");
  } catch (e: any) {
    logger.error({ err: e?.message }, "cancellation email failed (non-blocking)");
  }
}
