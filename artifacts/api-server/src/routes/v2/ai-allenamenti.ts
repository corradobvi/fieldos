// redeploy: 2026-05-21b
import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../../lib/auth";
import { logger } from "../../lib/logger";
import { chiamataClaude } from "../../lib/ai-claude";
import {
  verificaEScalaBudget,
  registraConsumoBudget,
  getBudgetInfo,
} from "../../lib/ai-budget";
import { randomUUID } from "crypto";

const router = Router();

// ─── helpers ────────────────────────────────────────────────────────────────

const CATEGORIE_IT: Record<string, string> = {
  riscaldamento:       "Riscaldamento",
  tecnica_individuale: "Tecnica individuale",
  tattica:             "Tattica",
  possesso_palla:      "Possesso palla",
  finalizzazione:      "Finalizzazione",
  atletica_fisico:     "Atletica / fisico",
  portieri:            "Portieri",
};

const LEVE_IT: Record<string, string> = {
  primi_calci:  "Primi Calci (U6/U7)",
  pulcini:      "Pulcini",
  esordienti:   "Esordienti",
  giovanissimi: "Giovanissimi",
  allievi:      "Allievi",
  juniores:     "Juniores",
};

function buildSystemPromptSessione(): string {
  return `Sei un assistente esperto di allenamento calcio giovanile italiano.
Devi generare una singola sessione di allenamento ben strutturata.
Rispondi SEMPRE in JSON valido con questa struttura esatta:
{
  "titolo": "stringa max 200 caratteri",
  "descrizione": "descrizione dettagliata della sessione (min 100 caratteri)",
  "durata_minuti": numero intero tra 10 e 120,
  "tag": ["array", "di", "stringhe", "max 8 tag"]
}
Non aggiungere testo fuori dal JSON. Non usare markdown. Solo JSON puro.`;
}

function buildSystemPromptAllenamento(): string {
  return `Sei un assistente esperto di allenamento calcio giovanile italiano.
Devi generare un piano di allenamento completo con più sessioni.
Rispondi SEMPRE in JSON valido con questa struttura esatta:
{
  "titolo": "titolo dell'allenamento max 200 caratteri",
  "obiettivo": "obiettivo principale max 300 caratteri",
  "sessioni": [
    {
      "titolo": "stringa max 200 caratteri",
      "descrizione": "descrizione dettagliata (min 80 caratteri)",
      "durata_minuti": numero intero tra 5 e 90,
      "categoria": "uno tra: riscaldamento|tecnica_individuale|tattica|possesso_palla|finalizzazione|atletica_fisico|portieri",
      "tag": ["array", "di", "stringhe", "max 6 tag"]
    }
  ]
}
Genera tra 2 e 6 sessioni. Non aggiungere testo fuori dal JSON. Solo JSON puro.`;
}

function buildSystemPromptSpunto(): string {
  return `Sei un assistente esperto di allenamento calcio giovanile italiano.
Devi fornire brevi spunti pratici per allenamenti.
Rispondi con testo libero, conciso e pratico (max 400 parole).
Usa elenchi puntati quando appropriato. Scrivi in italiano.`;
}

function isAdminLike(role: string): boolean {
  return role === "admin" || role === "mister_admin";
}

// ─── GET /api/v2/ai/budget ────────────────────────────────────────────────────
router.get("/ai/budget", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;
  try {
    const info = await getBudgetInfo(user.userId, user.societyId);
    return res.json(info);
  } catch (e: any) {
    logger.error({ err: e }, "ai/budget: errore");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─── GET /api/v2/ai/allowlist ────────────────────────────────────────────────
// Solo admin/mister_admin — restituisce tutti i mister della società con flag abilitato
router.get("/ai/allowlist", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;
  if (!isAdminLike(user.role)) {
    return res.status(403).json({ error: "forbidden" });
  }
  try {
    const [rows] = (await pool.execute(
      `SELECT u.id, u.nome, u.cognome, u.email, u.ruolo, u.leva AS leva_nome,
              COALESCE(al.abilitato, 0) AS abilitato,
              al.abilitato_da,
              al.updated_at
       FROM users u
       LEFT JOIN ai_societa_allowlist al ON al.mister_id = u.id AND al.societa_id = ?
       WHERE u.society_id = ?
         AND u.ruolo IN ('allenatore','mister_admin','admin','preparatore_portieri','dirigente')
       ORDER BY u.cognome, u.nome`,
      [user.societyId, user.societyId]
    )) as [any[], any];
    return res.json({ mister: rows });
  } catch (e: any) {
    logger.error({ err: e }, "ai/allowlist GET: errore");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─── POST /api/v2/ai/allowlist ───────────────────────────────────────────────
// Solo admin/mister_admin — abilita o disabilita un mister
router.post("/ai/allowlist", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;
  if (!isAdminLike(user.role)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { mister_id, abilitato } = req.body;
  if (typeof mister_id !== "number" || typeof abilitato !== "boolean") {
    return res.status(400).json({ error: "mister_id (number) e abilitato (boolean) richiesti" });
  }

  try {
    // Verifica che il mister appartenga alla società
    const [check] = (await pool.execute(
      "SELECT id FROM users WHERE id = ? AND society_id = ? LIMIT 1",
      [mister_id, user.societyId]
    )) as [any[], any];
    if (!check.length) {
      return res.status(404).json({ error: "mister non trovato in questa società" });
    }

    const [existing] = (await pool.execute(
      "SELECT id FROM ai_societa_allowlist WHERE societa_id = ? AND mister_id = ? LIMIT 1",
      [user.societyId, mister_id]
    )) as [any[], any];

    if (existing.length) {
      await pool.execute(
        "UPDATE ai_societa_allowlist SET abilitato = ?, abilitato_da = ? WHERE societa_id = ? AND mister_id = ?",
        [abilitato ? 1 : 0, user.userId, user.societyId, mister_id]
      );
    } else {
      await pool.execute(
        "INSERT INTO ai_societa_allowlist (id, societa_id, mister_id, abilitato, abilitato_da) VALUES (?, ?, ?, ?, ?)",
        [randomUUID(), user.societyId, mister_id, abilitato ? 1 : 0, user.userId]
      );
    }

    return res.json({ ok: true, mister_id, abilitato });
  } catch (e: any) {
    logger.error({ err: e }, "ai/allowlist POST: errore");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─── POST /api/v2/ai/spunto-rapido ───────────────────────────────────────────
// Genera uno spunto testuale rapido (nessun salvataggio)
router.post("/ai/spunto-rapido", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;

  const { domanda, eta_leva, categoria } = req.body;
  if (!domanda || typeof domanda !== "string" || domanda.trim().length < 5) {
    return res.status(400).json({ error: "domanda richiesta (min 5 caratteri)" });
  }

  const TOKEN_STIMATI = 1_500;

  const budget = await verificaEScalaBudget(user.userId, user.societyId, TOKEN_STIMATI);
  if (!budget.ok) {
    return res.status(402).json({
      error: "budget_insufficiente",
      motivo: budget.motivo,
      budgetRimasto: budget.budgetRimasto,
      budgetTotale: budget.budgetTotale,
    });
  }

  const levaStr = eta_leva ? ` per la categoria ${LEVE_IT[eta_leva] ?? eta_leva}` : "";
  const catStr  = categoria ? `, focus su ${CATEGORIE_IT[categoria] ?? categoria}` : "";
  const userPrompt = `${domanda.trim()}${levaStr}${catStr}`;

  let successo = false;
  let errore: string | undefined;
  let result: Awaited<ReturnType<typeof chiamataClaude>> | null = null;

  try {
    result = await chiamataClaude({
      systemPrompt: buildSystemPromptSpunto(),
      userPrompt,
      maxTokens: 600,
    });
    successo = true;
  } catch (e: any) {
    errore = e?.detail ?? e?.message ?? "ai_error";
    await registraConsumoBudget({
      userId: user.userId, societaId: user.societyId,
      tokenEffettivi: { input: 0, output: 0, totale: 0 },
      tipo: "spunto_rapido", promptInput: userPrompt, successo: false, errore,
    });
    if (e?.code === "rate_limit") return res.status(429).json({ error: "rate_limit", detail: errore });
    return res.status(502).json({ error: "ai_error", detail: errore });
  }

  await registraConsumoBudget({
    userId: user.userId, societaId: user.societyId,
    tokenEffettivi: { input: result.tokenInput, output: result.tokenOutput, totale: result.tokenTotale },
    tipo: "spunto_rapido", promptInput: userPrompt, successo,
  });

  return res.json({
    testo: result.testo,
    token_utilizzati: result.tokenTotale,
    budget_rimasto: budget.budgetRimasto - result.tokenTotale,
  });
});

// ─── POST /api/v2/ai/sessione-singola ────────────────────────────────────────
// Genera UNA sessione strutturata; opzionale: salva in sessioni_libreria
router.post("/ai/sessione-singola", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;

  const { categoria, eta_leva, durata_minuti, obiettivi, salva_in_libreria } = req.body;

  const CATEGORIE_VALIDE = ["riscaldamento","tecnica_individuale","tattica","possesso_palla","finalizzazione","atletica_fisico","portieri"];
  const LEVE_VALIDE      = ["primi_calci","pulcini","esordienti","giovanissimi","allievi","juniores"];

  if (!categoria || !CATEGORIE_VALIDE.includes(categoria)) {
    return res.status(400).json({ error: "categoria non valida", valide: CATEGORIE_VALIDE });
  }
  if (!eta_leva || !LEVE_VALIDE.includes(eta_leva)) {
    return res.status(400).json({ error: "eta_leva non valida", valide: LEVE_VALIDE });
  }
  if (durata_minuti && (typeof durata_minuti !== "number" || durata_minuti < 5 || durata_minuti > 120)) {
    return res.status(400).json({ error: "durata_minuti deve essere tra 5 e 120" });
  }

  const TOKEN_STIMATI = 2_000;

  const budget = await verificaEScalaBudget(user.userId, user.societyId, TOKEN_STIMATI);
  if (!budget.ok) {
    return res.status(402).json({
      error: "budget_insufficiente",
      motivo: budget.motivo,
      budgetRimasto: budget.budgetRimasto,
      budgetTotale: budget.budgetTotale,
    });
  }

  const durataParte = durata_minuti ? ` Durata: circa ${durata_minuti} minuti.` : "";
  const obiettiviParte = obiettivi ? ` Obiettivi specifici: ${String(obiettivi).slice(0, 300)}.` : "";
  const userPrompt =
    `Genera una sessione di ${CATEGORIE_IT[categoria]} per ${LEVE_IT[eta_leva]}.${durataParte}${obiettiviParte}`;

  let result: Awaited<ReturnType<typeof chiamataClaude>> | null = null;
  let errore: string | undefined;

  try {
    result = await chiamataClaude({
      systemPrompt: buildSystemPromptSessione(),
      userPrompt,
      maxTokens: 800,
    });
  } catch (e: any) {
    errore = e?.detail ?? e?.message ?? "ai_error";
    await registraConsumoBudget({
      userId: user.userId, societaId: user.societyId,
      tokenEffettivi: { input: 0, output: 0, totale: 0 },
      tipo: "sessione_singola", promptInput: userPrompt, successo: false, errore,
    });
    if (e?.code === "rate_limit") return res.status(429).json({ error: "rate_limit", detail: errore });
    return res.status(502).json({ error: "ai_error", detail: errore });
  }

  // Parse JSON dalla risposta AI
  let parsed: any;
  try {
    parsed = JSON.parse(result.testo);
  } catch {
    // Tenta estrazione JSON da testo misto
    const match = result.testo.match(/\{[\s\S]*\}/);
    if (!match) {
      await registraConsumoBudget({
        userId: user.userId, societaId: user.societyId,
        tokenEffettivi: { input: result.tokenInput, output: result.tokenOutput, totale: result.tokenTotale },
        tipo: "sessione_singola", promptInput: userPrompt, successo: false, errore: "json_parse_error",
      });
      return res.status(502).json({ error: "ai_error", detail: "risposta AI non è JSON valido" });
    }
    try { parsed = JSON.parse(match[0]); }
    catch { return res.status(502).json({ error: "ai_error", detail: "risposta AI non è JSON valido" }); }
  }

  await registraConsumoBudget({
    userId: user.userId, societaId: user.societyId,
    tokenEffettivi: { input: result.tokenInput, output: result.tokenOutput, totale: result.tokenTotale },
    tipo: "sessione_singola", promptInput: userPrompt, successo: true,
  });

  const sessione = {
    titolo:         String(parsed.titolo ?? "Sessione AI").slice(0, 200),
    descrizione:    String(parsed.descrizione ?? ""),
    durata_minuti:  Number(parsed.durata_minuti ?? durata_minuti ?? 30),
    categoria,
    eta_leva,
    tag:            Array.isArray(parsed.tag) ? parsed.tag.slice(0, 8).map(String) : [],
    origine_ai:     true,
  };

  // Salvataggio opzionale in sessioni_libreria
  let sessioneId: string | null = null;
  if (salva_in_libreria) {
    sessioneId = randomUUID();
    const societaId = user.societyId ?? null;
    await pool.execute(
      `INSERT INTO sessioni_libreria
         (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, origine_ai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'privata', TRUE)`,
      [
        sessioneId, user.userId, societaId,
        sessione.titolo, sessione.descrizione, sessione.durata_minuti,
        sessione.categoria, sessione.eta_leva,
        JSON.stringify(sessione.tag),
      ]
    );
  }

  return res.json({
    sessione,
    sessione_libreria_id: sessioneId,
    token_utilizzati: result.tokenTotale,
    budget_rimasto: budget.budgetRimasto - result.tokenTotale,
  });
});

// ─── POST /api/v2/ai/allenamento-completo ────────────────────────────────────
// Genera un piano di allenamento completo con più sessioni; opzionale: salva tutto
router.post("/ai/allenamento-completo", requireAuth, async (req, res) => {
  const user = (req as any).jwtUser;

  const {
    eta_leva, durata_totale_minuti, num_sessioni,
    obiettivo, categorie_preferite,
    salva_allenamento, leva_id, data_allenamento,
  } = req.body;

  const LEVE_VALIDE = ["primi_calci","pulcini","esordienti","giovanissimi","allievi","juniores"];
  const CATEGORIE_VALIDE = ["riscaldamento","tecnica_individuale","tattica","possesso_palla","finalizzazione","atletica_fisico","portieri"];

  if (!eta_leva || !LEVE_VALIDE.includes(eta_leva)) {
    return res.status(400).json({ error: "eta_leva non valida", valide: LEVE_VALIDE });
  }

  const TOKEN_STIMATI = 4_000;

  const budget = await verificaEScalaBudget(user.userId, user.societyId, TOKEN_STIMATI);
  if (!budget.ok) {
    return res.status(402).json({
      error: "budget_insufficiente",
      motivo: budget.motivo,
      budgetRimasto: budget.budgetRimasto,
      budgetTotale: budget.budgetTotale,
    });
  }

  const durataParte = durata_totale_minuti ? ` Durata totale: circa ${durata_totale_minuti} minuti.` : "";
  const numParte    = num_sessioni ? ` Genera esattamente ${num_sessioni} sessioni.` : "";
  const obietParte  = obiettivo ? ` Obiettivo principale: ${String(obiettivo).slice(0, 300)}.` : "";
  let catParte = "";
  if (Array.isArray(categorie_preferite) && categorie_preferite.length) {
    const catValide = categorie_preferite.filter((c: string) => CATEGORIE_VALIDE.includes(c));
    if (catValide.length) {
      catParte = ` Privilegia queste categorie: ${catValide.map((c: string) => CATEGORIE_IT[c]).join(", ")}.`;
    }
  }

  const userPrompt =
    `Crea un piano di allenamento completo per ${LEVE_IT[eta_leva]}.${durataParte}${numParte}${obietParte}${catParte}`;

  let result: Awaited<ReturnType<typeof chiamataClaude>> | null = null;
  let errore: string | undefined;

  try {
    result = await chiamataClaude({
      systemPrompt: buildSystemPromptAllenamento(),
      userPrompt,
      maxTokens: 2_000,
    });
  } catch (e: any) {
    errore = e?.detail ?? e?.message ?? "ai_error";
    await registraConsumoBudget({
      userId: user.userId, societaId: user.societyId,
      tokenEffettivi: { input: 0, output: 0, totale: 0 },
      tipo: "allenamento_completo", promptInput: userPrompt, successo: false, errore,
    });
    if (e?.code === "rate_limit") return res.status(429).json({ error: "rate_limit", detail: errore });
    return res.status(502).json({ error: "ai_error", detail: errore });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(result.testo);
  } catch {
    const match = result.testo.match(/\{[\s\S]*\}/);
    if (!match) {
      await registraConsumoBudget({
        userId: user.userId, societaId: user.societyId,
        tokenEffettivi: { input: result.tokenInput, output: result.tokenOutput, totale: result.tokenTotale },
        tipo: "allenamento_completo", promptInput: userPrompt, successo: false, errore: "json_parse_error",
      });
      return res.status(502).json({ error: "ai_error", detail: "risposta AI non è JSON valido" });
    }
    try { parsed = JSON.parse(match[0]); }
    catch { return res.status(502).json({ error: "ai_error", detail: "risposta AI non è JSON valido" }); }
  }

  await registraConsumoBudget({
    userId: user.userId, societaId: user.societyId,
    tokenEffettivi: { input: result.tokenInput, output: result.tokenOutput, totale: result.tokenTotale },
    tipo: "allenamento_completo", promptInput: userPrompt, successo: true,
  });

  const sessioniRaw: any[] = Array.isArray(parsed.sessioni) ? parsed.sessioni : [];
  const sessioni = sessioniRaw.slice(0, 6).map((s: any, i: number) => ({
    titolo:         String(s.titolo ?? `Sessione ${i + 1}`).slice(0, 200),
    descrizione:    String(s.descrizione ?? ""),
    durata_minuti:  Number(s.durata_minuti ?? 20),
    categoria:      CATEGORIE_VALIDE.includes(s.categoria) ? s.categoria : "tecnica_individuale",
    eta_leva,
    tag:            Array.isArray(s.tag) ? s.tag.slice(0, 6).map(String) : [],
    origine_ai:     true,
  }));

  const allenamentoAI = {
    titolo:    String(parsed.titolo ?? "Allenamento AI").slice(0, 200),
    obiettivo: parsed.obiettivo ? String(parsed.obiettivo).slice(0, 300) : null,
    sessioni,
  };

  // Salvataggio opzionale come allenamento reale
  let allenamentoId: string | null = null;
  if (salva_allenamento) {
    if (!leva_id || typeof leva_id !== "number") {
      return res.status(400).json({ error: "leva_id richiesto per salva_allenamento" });
    }
    if (!data_allenamento || typeof data_allenamento !== "string") {
      return res.status(400).json({ error: "data_allenamento (YYYY-MM-DD) richiesta per salva_allenamento" });
    }

    // Verifica che la leva appartenga alla società
    const [levaCheck] = (await pool.execute(
      "SELECT id FROM leve WHERE id = ? AND societa_id = ? LIMIT 1",
      [leva_id, user.societyId]
    )) as [any[], any];
    if (!levaCheck.length) {
      return res.status(403).json({ error: "leva non trovata o non autorizzata" });
    }

    const conn = await (pool as any).getConnection();
    try {
      await conn.beginTransaction();

      allenamentoId = randomUUID();
      const durataTotale = sessioni.reduce((s: number, se: any) => s + se.durata_minuti, 0);

      await conn.execute(
        `INSERT INTO allenamenti
           (id, leva_id, societa_id, creato_da, titolo, obiettivo, data, durata_totale_minuti)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [allenamentoId, leva_id, user.societyId, user.userId,
         allenamentoAI.titolo, allenamentoAI.obiettivo ?? null,
         data_allenamento, durataTotale]
      );

      for (let i = 0; i < sessioni.length; i++) {
        const s = sessioni[i];
        await conn.execute(
          `INSERT INTO allenamento_sessioni
             (id, allenamento_id, sessione_libreria_id, ordine,
              titolo_snapshot, descrizione_snapshot, durata_minuti_snapshot, categoria_snapshot, tag_snapshot)
           VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), allenamentoId, i + 1,
           s.titolo, s.descrizione, s.durata_minuti, s.categoria, JSON.stringify(s.tag)]
        );
      }

      await conn.commit();
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      logger.error({ err: e }, "ai/allenamento-completo: salvataggio fallito");
      return res.status(500).json({ error: "salvataggio_fallito", detail: e?.message });
    }
    conn.release();
  }

  return res.json({
    allenamento: allenamentoAI,
    allenamento_id: allenamentoId,
    token_utilizzati: result.tokenTotale,
    budget_rimasto: budget.budgetRimasto - result.tokenTotale,
  });
});

export default router;
