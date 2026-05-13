import { logger } from "./logger";

const RESEND_API = "https://api.resend.com/emails";
const FROM = "MyVivaio <noreply@myvivaio.app>";
const ADMIN_TO = "info@myvivaio.app";

interface SendOpts {
  to: string;
  subject: string;
  html: string;
}

async function sendMail(opts: SendOpts): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn("RESEND_API_KEY not set — email skipped");
    return;
  }
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Resend ${resp.status}: ${body}`);
  }
}

export async function sendWelcomeEmails(opts: {
  nome: string;
  cognome: string;
  email: string;
  nomeSocieta: string;
  piano: string;
  demoExpires: Date;
}): Promise<void> {
  const { nome, cognome, email, nomeSocieta, piano, demoExpires } = opts;
  const pianoLabel = piano === "mister" ? "Mister" : piano === "mister_pro" ? "Mister Pro" : "Società";
  const scadenza = demoExpires.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const userHtml = `
<div style="font-family:sans-serif;max-width:540px;margin:auto;color:#1e293b;">
  <div style="background:#1A7A4A;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
    <img src="https://app.myvivaio.app/icons/icon-192.png" width="64" style="border-radius:14px;" alt="MyVivaio">
    <h1 style="color:white;font-size:1.6rem;margin:12px 0 4px;">Benvenuto in MyVivaio!</h1>
    <p style="color:rgba(255,255,255,.75);margin:0;font-size:.9rem;">La tua squadra, sempre con te</p>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px;">
    <p>Ciao <strong>${nome}</strong> 👋</p>
    <p>Il tuo account per <strong>${nomeSocieta}</strong> è attivo. Hai <strong>${pianoLabel}</strong> in prova gratuita fino al <strong>${scadenza}</strong>.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:.85rem;color:#166534;"><strong>Accedi con:</strong><br>Email: ${email}<br>La password che hai scelto in fase di registrazione</p>
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://app.myvivaio.app" style="background:#1A7A4A;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.95rem;">Accedi ora →</a>
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
    <p style="font-size:.75rem;color:#94a3b8;text-align:center;margin:0;">MyVivaio · <a href="https://myvivaio.app" style="color:#94a3b8;">myvivaio.app</a> · <a href="mailto:info@myvivaio.app" style="color:#94a3b8;">info@myvivaio.app</a></p>
  </div>
</div>`;

  const adminHtml = `
<div style="font-family:sans-serif;color:#1e293b;">
  <h3 style="color:#1A7A4A;">🆕 Nuova registrazione su MyVivaio</h3>
  <table style="border-collapse:collapse;">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Nome</td><td><strong>${nome} ${cognome}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Email</td><td>${email}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Società</td><td><strong>${nomeSocieta}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Piano</td><td>${pianoLabel}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Demo scade</td><td>${scadenza}</td></tr>
  </table>
</div>`;

  try {
    await Promise.all([
      sendMail({ to: email, subject: `Benvenuto in MyVivaio — il tuo accesso è attivo`, html: userHtml }),
      sendMail({ to: ADMIN_TO, subject: `[MyVivaio] Nuova registrazione: ${nome} ${cognome} — ${nomeSocieta}`, html: adminHtml }),
    ]);
    logger.info({ email }, "welcome emails sent");
  } catch (e: any) {
    logger.error({ err: e }, "email send failed (non-blocking)");
  }
}
