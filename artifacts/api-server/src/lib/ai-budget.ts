import { randomUUID } from "crypto";
import { pool } from "@workspace/db";
import { logger } from "./logger";
import { AI_MODEL } from "./ai-claude";

const BUDGET_MISTER_PRO = 35_000;
const BUDGET_SOCIETA    = 280_000;

const PIANO_NORM: Record<string, string> = {
  gratuito: "mister", base: "mister_pro", premium: "societa",
};

function normPiano(p: string): string {
  return PIANO_NORM[p] ?? p;
}

function meseCorrente(): string {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

function primoMeseSuccessivo(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

async function getPiano(societaId: number): Promise<string> {
  const [rows] = (await pool.execute(
    "SELECT piano FROM societies WHERE id = ? LIMIT 1",
    [societaId]
  )) as [any[], any];
  return normPiano(rows[0]?.piano ?? "mister");
}

// INSERT IGNORE + SELECT per budget_key: atomico, immune a race condition e al bug NULL in UNIQUE KEY
async function getOrCreateBudgetRow(opts: {
  misterId: number | null;
  societaId: number | null;
  mese: string;
  budget: number;
}): Promise<{ id: string; tokenConsumati: number; tokenBudget: number }> {
  const { misterId, societaId, mese, budget } = opts;
  const budgetKey = `${misterId ?? 0}_${societaId ?? 0}_${mese}`;

  // INSERT IGNORE: se esiste già una riga con la stessa budget_key non fa nulla (atomico)
  await pool.execute(
    "INSERT IGNORE INTO ai_budget_utilizzo (id, mister_id, societa_id, mese_riferimento, token_consumati, token_budget, budget_key) VALUES (?, ?, ?, ?, 0, ?, ?)",
    [randomUUID(), misterId, societaId, mese, budget, budgetKey]
  );

  const [rows] = (await pool.execute(
    "SELECT id, token_consumati, token_budget FROM ai_budget_utilizzo WHERE budget_key = ? LIMIT 1",
    [budgetKey]
  )) as [any[], any];

  return {
    id: rows[0].id as string,
    tokenConsumati: rows[0].token_consumati as number,
    tokenBudget: rows[0].token_budget as number,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export interface BudgetCheck {
  ok: boolean;
  budgetRimasto: number;
  budgetTotale: number;
  motivo?: string;
}

export async function verificaEScalaBudget(
  userId: number,
  societaId: number,
  tokenStimati: number
): Promise<BudgetCheck> {
  const piano = await getPiano(societaId);

  if (piano === "mister") {
    return { ok: false, budgetRimasto: 0, budgetTotale: 0, motivo: "piano_non_supportato" };
  }

  const mese = meseCorrente();

  if (piano === "mister_pro") {
    const row = await getOrCreateBudgetRow({ misterId: userId, societaId: null, mese, budget: BUDGET_MISTER_PRO });
    const rimasto = row.tokenBudget - row.tokenConsumati;
    if (row.tokenConsumati + tokenStimati > row.tokenBudget) {
      return { ok: false, budgetRimasto: Math.max(0, rimasto), budgetTotale: row.tokenBudget, motivo: "budget_esaurito" };
    }
    return { ok: true, budgetRimasto: rimasto - tokenStimati, budgetTotale: row.tokenBudget };
  }

  // piano === "societa"
  const [allowed] = (await pool.execute(
    "SELECT abilitato FROM ai_societa_allowlist WHERE societa_id = ? AND mister_id = ? LIMIT 1",
    [societaId, userId]
  )) as [any[], any];
  if (!allowed.length || !allowed[0].abilitato) {
    return { ok: false, budgetRimasto: 0, budgetTotale: BUDGET_SOCIETA, motivo: "non_abilitato_ai" };
  }

  const row = await getOrCreateBudgetRow({ misterId: null, societaId, mese, budget: BUDGET_SOCIETA });
  const rimasto = row.tokenBudget - row.tokenConsumati;
  if (row.tokenConsumati + tokenStimati > row.tokenBudget) {
    return { ok: false, budgetRimasto: Math.max(0, rimasto), budgetTotale: row.tokenBudget, motivo: "budget_esaurito" };
  }
  return { ok: true, budgetRimasto: rimasto - tokenStimati, budgetTotale: row.tokenBudget };
}

export async function registraConsumoBudget(params: {
  userId: number;
  societaId: number;
  tokenEffettivi: { input: number; output: number; totale: number };
  tipo: "sessione_singola" | "allenamento_completo" | "spunto_rapido";
  promptInput: string;
  successo: boolean;
  errore?: string;
}): Promise<void> {
  const { userId, societaId, tokenEffettivi, tipo, promptInput, successo, errore } = params;
  const piano = await getPiano(societaId);
  const mese  = meseCorrente();

  // Aggiorna contatore
  try {
    if (piano === "mister_pro") {
      await pool.execute(
        "UPDATE ai_budget_utilizzo SET token_consumati = token_consumati + ? WHERE mister_id = ? AND societa_id IS NULL AND mese_riferimento = ?",
        [tokenEffettivi.totale, userId, mese]
      );
    } else if (piano === "societa") {
      await pool.execute(
        "UPDATE ai_budget_utilizzo SET token_consumati = token_consumati + ? WHERE societa_id = ? AND mister_id IS NULL AND mese_riferimento = ?",
        [tokenEffettivi.totale, societaId, mese]
      );
    }
  } catch (e: any) {
    logger.warn({ err: e }, "ai-budget: aggiornamento token_consumati fallito");
  }

  // Log richiesta
  try {
    await pool.execute(
      `INSERT INTO ai_richieste_log
         (id, mister_id, societa_id, tipo, prompt_input, token_input, token_output, token_totale, modello, successo, errore)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        userId,
        societaId || null,
        tipo,
        promptInput.slice(0, 5000),
        tokenEffettivi.input,
        tokenEffettivi.output,
        tokenEffettivi.totale,
        AI_MODEL,
        successo ? 1 : 0,
        errore ?? null,
      ]
    );
  } catch (e: any) {
    logger.warn({ err: e }, "ai-budget: insert ai_richieste_log fallito");
  }
}

export interface BudgetInfo {
  abilitato: boolean;
  piano: string;
  motivo_non_abilitato?: string;
  token_consumati: number;
  token_budget: number;
  percentuale_utilizzata: number;
  mese_riferimento: string;
  rinnovo_il: string;
}

export async function getBudgetInfo(userId: number, societaId: number): Promise<BudgetInfo> {
  const piano      = await getPiano(societaId);
  const mese       = meseCorrente();
  const rinnovo_il = primoMeseSuccessivo();

  if (piano === "mister") {
    return {
      abilitato: false, piano, motivo_non_abilitato: "piano_non_supportato",
      token_consumati: 0, token_budget: 0, percentuale_utilizzata: 0, mese_riferimento: mese, rinnovo_il,
    };
  }

  if (piano === "mister_pro") {
    const row = await getOrCreateBudgetRow({ misterId: userId, societaId: null, mese, budget: BUDGET_MISTER_PRO });
    const perc = row.tokenBudget > 0 ? Math.round((row.tokenConsumati / row.tokenBudget) * 100) : 0;
    return {
      abilitato: true, piano,
      token_consumati: row.tokenConsumati, token_budget: row.tokenBudget,
      percentuale_utilizzata: perc, mese_riferimento: mese, rinnovo_il,
    };
  }

  // societa
  const [allowed] = (await pool.execute(
    "SELECT abilitato FROM ai_societa_allowlist WHERE societa_id = ? AND mister_id = ? LIMIT 1",
    [societaId, userId]
  )) as [any[], any];
  const isAbilitato = allowed.length > 0 && !!allowed[0].abilitato;

  if (!isAbilitato) {
    return {
      abilitato: false, piano, motivo_non_abilitato: "non_abilitato_ai",
      token_consumati: 0, token_budget: BUDGET_SOCIETA, percentuale_utilizzata: 0, mese_riferimento: mese, rinnovo_il,
    };
  }

  const row  = await getOrCreateBudgetRow({ misterId: null, societaId, mese, budget: BUDGET_SOCIETA });
  const perc = row.tokenBudget > 0 ? Math.round((row.tokenConsumati / row.tokenBudget) * 100) : 0;
  return {
    abilitato: true, piano,
    token_consumati: row.tokenConsumati, token_budget: row.tokenBudget,
    percentuale_utilizzata: perc, mese_riferimento: mese, rinnovo_il,
  };
}
