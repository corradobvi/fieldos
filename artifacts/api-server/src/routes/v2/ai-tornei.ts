// ai-tornei.ts — import torneo da PDF con Claude Sonnet PDF nativo
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../lib/auth";
import { logger } from "../../lib/logger";
import { AI_MODEL } from "../../lib/ai-claude";
import {
  verificaEScalaBudget,
  registraConsumoBudget,
} from "../../lib/ai-budget";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const API_URL = "https://api.anthropic.com/v1/messages";
const TOKEN_STIMATI = 8_000;

const SYSTEM_PROMPT =
  "Sei un assistente che estrae dati strutturati da PDF di tornei di calcio giovanile italiani. " +
  "Restituisci SOLO JSON valido, nessun testo aggiuntivo, nessun markdown.";

const USER_PROMPT =
  `Analizza questo PDF di un torneo di calcio giovanile ed estrai i dati strutturati.

Restituisci SOLO il seguente oggetto JSON (senza markdown, senza testo aggiuntivo):
{
  "nome": "Nome del torneo",
  "luogo": "Città/campo oppure null",
  "dataInizio": "YYYY-MM-DD oppure null",
  "dataFine": "YYYY-MM-DD oppure null",
  "gironi": [
    { "nome": "A", "squadre": ["NOME1", "NOME2", "NOME3"] }
  ],
  "partite": [
    {
      "data": "YYYY-MM-DD oppure null",
      "orario": "HH:MM oppure null",
      "girone": "A",
      "casa": "NOME1",
      "ospite": "NOME2",
      "luogo": null
    }
  ]
}

Per le squadre usa i nomi esattamente come appaiono nel PDF, in maiuscolo.
Se un campo non è identificabile usa null. Non aggiungere campi extra.`;

// POST /api/v2/ai/import-torneo-pdf
router.post(
  "/ai/import-torneo-pdf",
  requireAuth,
  (req: any, res: any, next: any) => {
    upload.single("file")(req, res, (err: any) => {
      if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "file_troppo_grande",
          message: "Il PDF non può superare 5 MB",
        });
      }
      if (err) {
        return res.status(400).json({
          error: "upload_error",
          message: String(err.message || err),
        });
      }
      next();
    });
  },
  async (req: any, res: any) => {
    const user = req.jwtUser;

    if (!req.file) {
      return res.status(400).json({ error: "file_mancante", message: "Carica un file PDF" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "file_non_valido", message: "Il file deve essere un PDF" });
    }

    let budget: Awaited<ReturnType<typeof verificaEScalaBudget>>;
    try {
      budget = await verificaEScalaBudget(user.userId, user.societyId, TOKEN_STIMATI);
    } catch (e: any) {
      logger.error({ err: e }, "ai-tornei: budget check failed");
      return res.status(500).json({ error: "server_error", message: "Errore server" });
    }
    if (!budget.ok) {
      return res.status(402).json({
        error: "budget_insufficiente",
        motivo: budget.motivo,
        budgetRimasto: budget.budgetRimasto,
        budgetTotale: budget.budgetTotale,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    if (!apiKey) {
      return res.status(503).json({ error: "api_key_invalid", message: "ANTHROPIC_API_KEY non configurata" });
    }

    const pdfBase64 = req.file.buffer.toString("base64");

    let resp: Response;
    try {
      resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "pdfs-2024-09-25",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: pdfBase64,
                  },
                },
                {
                  type: "text",
                  text: USER_PROMPT,
                },
              ],
            },
          ],
        }),
      });
    } catch (e: any) {
      logger.error({ err: e }, "ai-tornei: fetch error");
      return res.status(500).json({ error: "ai_error", message: `Errore di rete: ${e?.message ?? "fetch failed"}` });
    }

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      logger.warn({ status: resp.status, body: body.slice(0, 200) }, "ai-tornei: Anthropic error");
      if (resp.status === 429)
        return res.status(429).json({ error: "rate_limit", message: "Limite richieste AI raggiunto, riprova tra qualche minuto" });
      if (resp.status === 401)
        return res.status(401).json({ error: "api_key_invalid", message: "Chiave API non valida" });
      return res.status(500).json({ error: "ai_error", message: `HTTP ${resp.status}` });
    }

    let data: any;
    try {
      data = await resp.json();
    } catch {
      return res.status(500).json({ error: "ai_error", message: "Risposta non JSON da Anthropic" });
    }

    const testo = (data.content?.[0]?.text as string) ?? "";
    const tokenInput  = (data.usage?.input_tokens  as number) ?? 0;
    const tokenOutput = (data.usage?.output_tokens as number) ?? 0;
    const tokenTotale = tokenInput + tokenOutput;

    logger.info({ model: AI_MODEL, tokenInput, tokenOutput }, "ai-tornei: chiamata completata");

    registraConsumoBudget({
      userId: user.userId,
      societaId: user.societyId,
      tokenEffettivi: { input: tokenInput, output: tokenOutput, totale: tokenTotale },
      tipo: "spunto_rapido",
      promptInput: "import-torneo-pdf",
      successo: true,
    }).catch((e: any) => logger.warn({ err: e }, "ai-tornei: budget registration failed"));

    // Claude sometimes wraps JSON in ``` despite instructions
    let torneoData: any;
    try {
      const jsonMatch = testo.match(/```json\s*([\s\S]*?)```/) || testo.match(/```\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : testo.trim();
      torneoData = JSON.parse(jsonStr);
    } catch {
      logger.warn({ testo: testo.slice(0, 500) }, "ai-tornei: JSON parse failed");
      return res.status(422).json({
        error: "parsing_fallito",
        message: "Impossibile parsare il PDF, verifica il file",
      });
    }

    return res.json({ ok: true, data: torneoData });
  }
);

export default router;
