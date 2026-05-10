import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const SYSTEM_PROMPT = `Sei l'assistente di MyVivaio, piattaforma italiana di gestione per società di calcio giovanile.
Rispondi in italiano semplice e diretto, massimo 3-4 frasi.
Conosci tutte le funzioni dell'app: rosa giocatori, presenze, convocazioni, comunicazioni, chat interna, campionati, tornei, amichevoli, calendario, quote, documenti, impostazioni.
Non inventare funzioni che non esistono. Se non sai rispondere, dillo chiaramente.`;

// POST /api/ai-assist — risposta AI per domande non coperte dalle FAQ
router.post("/ai-assist", async (req, res) => {
  const { question, section, role } = req.body as {
    question?: unknown;
    section?: unknown;
    role?: unknown;
  };

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "missing_question" });
  }

  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return res.status(503).json({ error: "ai_not_configured" });
  }

  const userMsg = [
    section ? `Sezione attiva: ${section}.` : "",
    role ? `Ruolo utente: ${role}.` : "",
    `Domanda: ${question.trim()}`,
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.warn({ status: response.status, body }, "Anthropic API error");
      return res.status(502).json({ error: "ai_error", detail: body.slice(0, 200) });
    }

    const data = (await response.json()) as any;
    const answer: string = data?.content?.[0]?.text ?? "";
    return res.json({ answer });
  } catch (e: any) {
    logger.error({ err: e }, "ai-assist fetch error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
