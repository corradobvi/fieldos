import { logger } from "./logger";

const RESEND_API = "https://api.resend.com/emails";
const FROM = "MyVivaio <noreply@myvivaio.app>";
const ADMIN_TO = "info@myvivaio.app";

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn("RESEND_API_KEY not set — email skipped");
    return;
  }
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
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
  phone: string;
  nomeSocieta: string;
  piano: string;
  demoExpires: Date;
}): Promise<void> {
  const { nome, cognome, email, phone, nomeSocieta, piano, demoExpires } = opts;

  const pianoLabel = piano === "mister" ? "Mister" : piano === "mister_pro" ? "Mister Pro" : "Società";
  const dataReg    = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const waLink     = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;

  const adminHtml = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">🆕 Nuova registrazione — MyVivaio</h2>
  <p style="color:#64748b;font-size:.85rem;margin-top:0;">${dataReg}</p>
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
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">WhatsApp</td>
      <td style="padding:8px 0;">${waLink ? `<a href="${waLink}" style="color:#1A7A4A;font-weight:700;">${phone}</a>` : "—"}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Società</td>
      <td style="padding:8px 0;font-weight:700;">${nomeSocieta}</td>
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
  ${waLink ? `<p style="margin-top:20px;"><a href="${waLink}" style="background:#25d366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">💬 Apri WhatsApp</a></p>` : ""}
</div>`;

  try {
    await sendMail(
      ADMIN_TO,
      `[MyVivaio] Nuova registrazione: ${nome} ${cognome} — ${nomeSocieta}`,
      adminHtml
    );
    logger.info({ email }, "admin notification sent");
  } catch (e: any) {
    logger.error({ err: e }, "email send failed (non-blocking)");
  }
}
