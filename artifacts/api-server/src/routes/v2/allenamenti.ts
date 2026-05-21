import { Router } from "express";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import multer from "multer";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth } from "../../lib/auth";
import { requirePermission } from "../../lib/permissions";

const router = Router();

// ─── Costanti ENUM ──────────────────────────────────────────────────────────

const CATEGORIE_VALIDE = new Set([
  "riscaldamento", "tecnica_individuale", "tattica", "possesso_palla",
  "finalizzazione", "atletica_fisico", "portieri",
]);
const ETA_LEVA_VALIDE = new Set([
  "primi_calci", "pulcini", "esordienti", "giovanissimi", "allievi", "juniores",
]);
const RUOLI_GENITORE = new Set(["genitore", "giocatore", "nonno"]);

// ─── Multer: upload note vocali ──────────────────────────────────────────────

const AUDIO_EXT_VALIDE = new Set(["m4a", "mp3", "wav", "webm", "ogg"]);
const AUDIO_MIME: Record<string, string> = {
  m4a: "audio/m4a", mp3: "audio/mpeg", wav: "audio/wav",
  webm: "audio/webm", ogg: "audio/ogg",
};

const audioStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(process.cwd(), "storage", "note-vocali", req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (!AUDIO_EXT_VALIDE.has(ext)) { cb(new Error("formato_non_supportato"), ""); return; }
    cb(null, `${randomUUID()}.${ext}`);
  },
});
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (!AUDIO_EXT_VALIDE.has(ext)) { cb(new Error("formato_non_supportato")); return; }
    cb(null, true);
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateTag(tag: unknown): string[] | null {
  if (!Array.isArray(tag)) return null;
  if (tag.length > 10) return null;
  if (!tag.every(t => typeof t === "string" && t.length <= 30)) return null;
  return tag as string[];
}

async function ricalcolaDurata(conn: any, allenamentoId: string): Promise<void> {
  await conn.execute(
    `UPDATE allenamenti SET durata_totale_minuti =
       COALESCE((SELECT SUM(durata_minuti_snapshot) FROM allenamento_sessioni WHERE allenamento_id = ?), 0)
     WHERE id = ?`,
    [allenamentoId, allenamentoId]
  );
}

async function compattaOrdini(conn: any, allenamentoId: string): Promise<void> {
  const [rows] = (await conn.execute(
    "SELECT id FROM allenamento_sessioni WHERE allenamento_id = ? ORDER BY ordine ASC",
    [allenamentoId]
  )) as [any[], any];
  for (let i = 0; i < rows.length; i++) {
    await conn.execute(
      "UPDATE allenamento_sessioni SET ordine = ? WHERE id = ?",
      [i + 1, rows[i].id]
    );
  }
}

async function snapshotDaLibreria(
  conn: any,
  sessioneLibreriaId: string,
  userId: number
): Promise<any | null> {
  const [rows] = (await conn.execute(
    `SELECT titolo, descrizione, durata_minuti, categoria, tag, visibilita, ufficiale_myvivaio, mister_id, note
     FROM sessioni_libreria WHERE id = ?`,
    [sessioneLibreriaId]
  )) as [any[], any];
  if (!rows.length) return null;
  const s = rows[0];
  // Verifica accessibilità: propria, pubblica o ufficiale
  if (s.mister_id !== userId && s.visibilita !== "pubblica" && !s.ufficiale_myvivaio) return null;
  return s;
}

// ─── PARTE A: LIBRERIA SESSIONI ───────────────────────────────────────────────

// GET /api/v2/allenamenti/sessioni-libreria
router.get("/allenamenti/sessioni-libreria", requireAuth, async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const {
    ambito  = "personale",
    categoria,
    eta_leva,
    q,
    limit   = "50",
    offset  = "0",
  } = req.query as Record<string, string>;

  const limitN  = Math.min(parseInt(limit)  || 50,  200);
  const offsetN = Math.max(parseInt(offset) || 0,    0);

  const ambitiValidi = new Set(["personale", "community", "ufficiali", "tutte"]);
  if (!ambitiValidi.has(ambito)) return res.status(400).json({ error: "ambito_non_valido" });
  if (categoria && !CATEGORIE_VALIDE.has(categoria)) return res.status(400).json({ error: "categoria_non_valida" });
  if (eta_leva  && !ETA_LEVA_VALIDE.has(eta_leva))  return res.status(400).json({ error: "eta_leva_non_valida" });

  // Build WHERE dinamico
  const conditions: string[] = [];
  const params: any[]        = [];

  if (ambito === "personale") {
    conditions.push("sl.mister_id = ?"); params.push(userId);
  } else if (ambito === "community") {
    conditions.push("sl.visibilita = 'pubblica' AND sl.ufficiale_myvivaio = FALSE AND sl.mister_id != ?");
    params.push(userId);
  } else if (ambito === "ufficiali") {
    conditions.push("sl.ufficiale_myvivaio = TRUE");
  } else { // tutte
    conditions.push("(sl.mister_id = ? OR sl.visibilita = 'pubblica' OR sl.ufficiale_myvivaio = TRUE)");
    params.push(userId);
  }
  if (categoria) { conditions.push("sl.categoria = ?"); params.push(categoria); }
  if (eta_leva)  { conditions.push("sl.eta_leva = ?");  params.push(eta_leva); }
  if (q)         { conditions.push("(sl.titolo LIKE ? OR sl.descrizione LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [countRows] = (await pool.execute(
      `SELECT COUNT(*) AS total FROM sessioni_libreria sl ${where}`,
      params
    )) as [any[], any];
    const total = countRows[0].total as number;

    const [rows] = (await pool.execute(
      `SELECT sl.id, sl.titolo, sl.descrizione, sl.durata_minuti, sl.categoria, sl.eta_leva,
              sl.tag, sl.visibilita, sl.ufficiale_myvivaio, sl.origine_ai, sl.usata_count, sl.created_at,
              CASE WHEN sl.ufficiale_myvivaio = TRUE THEN 'MyVivaio'
                   ELSE CONCAT(u.nome, ' ', u.cognome) END AS autore_nome
       FROM sessioni_libreria sl
       LEFT JOIN users u ON u.id = sl.mister_id
       ${where}
       ORDER BY sl.usata_count DESC, sl.created_at DESC
       LIMIT ${limitN} OFFSET ${offsetN}`,
      params
    )) as [any[], any];

    return res.json({ total, items: rows.map(r => ({ ...r, tag: r.tag ?? [] })) });
  } catch (e: any) {
    logger.error({ err: e }, "GET sessioni-libreria error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/allenamenti/sessioni-libreria
router.post("/allenamenti/sessioni-libreria", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const { titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita = "privata", note } =
    req.body as Record<string, any>;

  // Validazione
  if (!titolo || typeof titolo !== "string" || titolo.length < 3 || titolo.length > 200)
    return res.status(400).json({ error: "titolo_non_valido", message: "Titolo: 3-200 caratteri" });
  if (!descrizione || typeof descrizione !== "string" || descrizione.length < 10)
    return res.status(400).json({ error: "descrizione_non_valida", message: "Descrizione: minimo 10 caratteri" });
  const durata = parseInt(durata_minuti);
  if (isNaN(durata) || durata < 5 || durata > 180)
    return res.status(400).json({ error: "durata_non_valida", message: "Durata: 5-180 minuti" });
  if (!categoria || !CATEGORIE_VALIDE.has(categoria))
    return res.status(400).json({ error: "categoria_non_valida" });
  if (!eta_leva || !ETA_LEVA_VALIDE.has(eta_leva))
    return res.status(400).json({ error: "eta_leva_non_valida" });
  if (!["privata", "pubblica"].includes(visibilita))
    return res.status(400).json({ error: "visibilita_non_valida" });

  let tagValidato: string[] = [];
  if (tag !== undefined) {
    const t = validateTag(tag);
    if (t === null) return res.status(400).json({ error: "tag_non_validi", message: "Max 10 tag, 30 char ciascuno" });
    tagValidato = t;
  }

  const id = randomUUID();
  try {
    await pool.execute(
      `INSERT INTO sessioni_libreria
         (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, note, ufficiale_myvivaio, origine_ai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
      [id, userId, societyId || null, titolo, descrizione, durata, categoria, eta_leva,
       tagValidato.length ? JSON.stringify(tagValidato) : null, visibilita,
       (typeof note === "string" && note.trim()) ? note.trim() : null]
    );

    const [rows] = (await pool.execute("SELECT * FROM sessioni_libreria WHERE id = ?", [id])) as [any[], any];
    return res.status(201).json({ ...rows[0], tag: rows[0].tag ?? [] });
  } catch (e: any) {
    logger.error({ err: e }, "POST sessioni-libreria error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PATCH /api/v2/allenamenti/sessioni-libreria/:id
router.patch("/allenamenti/sessioni-libreria/:id", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId } = req.jwtUser!;
  const { id }     = req.params;

  try {
    const [existing] = (await pool.execute(
      "SELECT id, mister_id FROM sessioni_libreria WHERE id = ?", [id]
    )) as [any[], any];
    if (!existing.length) return res.status(404).json({ error: "not_found" });
    if (existing[0].mister_id !== userId) return res.status(403).json({ error: "forbidden", message: "Solo l'autore può modificare la sessione" });

    const { titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, note } =
      req.body as Record<string, any>;

    const updates: string[] = [];
    const params: any[]     = [];

    if (titolo !== undefined) {
      if (typeof titolo !== "string" || titolo.length < 3 || titolo.length > 200)
        return res.status(400).json({ error: "titolo_non_valido" });
      updates.push("titolo = ?"); params.push(titolo);
    }
    if (descrizione !== undefined) {
      if (typeof descrizione !== "string" || descrizione.length < 10)
        return res.status(400).json({ error: "descrizione_non_valida" });
      updates.push("descrizione = ?"); params.push(descrizione);
    }
    if (durata_minuti !== undefined) {
      const d = parseInt(durata_minuti);
      if (isNaN(d) || d < 5 || d > 180) return res.status(400).json({ error: "durata_non_valida" });
      updates.push("durata_minuti = ?"); params.push(d);
    }
    if (categoria !== undefined) {
      if (!CATEGORIE_VALIDE.has(categoria)) return res.status(400).json({ error: "categoria_non_valida" });
      updates.push("categoria = ?"); params.push(categoria);
    }
    if (eta_leva !== undefined) {
      if (!ETA_LEVA_VALIDE.has(eta_leva)) return res.status(400).json({ error: "eta_leva_non_valida" });
      updates.push("eta_leva = ?"); params.push(eta_leva);
    }
    if (tag !== undefined) {
      const t = validateTag(tag);
      if (t === null) return res.status(400).json({ error: "tag_non_validi" });
      updates.push("tag = ?"); params.push(t.length ? JSON.stringify(t) : null);
    }
    if (visibilita !== undefined) {
      if (!["privata", "pubblica"].includes(visibilita)) return res.status(400).json({ error: "visibilita_non_valida" });
      updates.push("visibilita = ?"); params.push(visibilita);
    }
    if (note !== undefined) {
      updates.push("note = ?");
      params.push((typeof note === "string" && note.trim()) ? note.trim() : null);
    }

    if (!updates.length) return res.status(400).json({ error: "nessun_campo_da_aggiornare" });

    params.push(id);
    await pool.execute(`UPDATE sessioni_libreria SET ${updates.join(", ")} WHERE id = ?`, params);

    const [rows] = (await pool.execute("SELECT * FROM sessioni_libreria WHERE id = ?", [id])) as [any[], any];
    return res.json({ ...rows[0], tag: rows[0].tag ?? [] });
  } catch (e: any) {
    logger.error({ err: e }, "PATCH sessioni-libreria error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/allenamenti/sessioni-libreria/:id
router.delete("/allenamenti/sessioni-libreria/:id", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId } = req.jwtUser!;
  const { id }     = req.params;

  try {
    const [existing] = (await pool.execute(
      "SELECT id, mister_id FROM sessioni_libreria WHERE id = ?", [id]
    )) as [any[], any];
    if (!existing.length) return res.status(404).json({ error: "not_found" });
    if (existing[0].mister_id !== userId) return res.status(403).json({ error: "forbidden" });

    const [usageRows] = (await pool.execute(
      "SELECT COUNT(*) AS count FROM allenamento_sessioni WHERE sessione_libreria_id = ?", [id]
    )) as [any[], any];
    const usageCount = usageRows[0].count as number;
    if (usageCount > 0) {
      return res.status(409).json({ error: "sessione_in_uso", count: usageCount });
    }

    await pool.execute("DELETE FROM sessioni_libreria WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (e: any) {
    logger.error({ err: e }, "DELETE sessioni-libreria error");
    return res.status(500).json({ error: "server_error" });
  }
});

// ─── PARTE B: ALLENAMENTI ────────────────────────────────────────────────────

// GET /api/v2/allenamenti
router.get("/allenamenti", requireAuth, async (req, res) => {
  const { userId, societyId, role } = req.jwtUser!;
  const isGenitore = RUOLI_GENITORE.has(role);
  const { leva_id, da, a, limit = "30", offset = "0" } = req.query as Record<string, string>;
  const limitN  = Math.min(parseInt(limit) || 30, 200);
  const offsetN = Math.max(parseInt(offset) || 0, 0);

  try {
    const conditions: string[] = ["a.societa_id = ?"];
    const params: any[]        = [societyId];

    if (leva_id) { conditions.push("a.leva_id = ?"); params.push(parseInt(leva_id)); }
    if (da)      { conditions.push("a.data >= ?");   params.push(da); }
    if (a)       { conditions.push("a.data <= ?");   params.push(a); }

    if (isGenitore) {
      conditions.push("a.visibilita_genitori = TRUE");
      conditions.push("a.created_at <= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
      // Filtra per leva dei figli
      conditions.push(
        `a.leva_id IN (
          SELECT DISTINCT l.id FROM leve l
          JOIN players p ON p.leva = l.nome AND p.society_id = l.society_id
          JOIN user_players up ON up.player_id = p.id
          WHERE up.user_id = ? AND l.society_id = ?
        )`
      );
      params.push(userId, societyId);
    }

    const where = "WHERE " + conditions.join(" AND ");

    const selectFields = isGenitore
      ? `a.id, a.titolo, a.obiettivo, a.data, a.durata_totale_minuti,
         (SELECT COUNT(*) FROM allenamento_sessioni WHERE allenamento_id = a.id) AS num_sessioni`
      : `a.id, a.titolo, a.obiettivo, a.data, a.durata_totale_minuti, a.visibilita_genitori,
         (SELECT COUNT(*) FROM allenamento_sessioni WHERE allenamento_id = a.id) AS num_sessioni,
         CONCAT(u.nome, ' ', u.cognome) AS creato_da_nome`;

    const join = isGenitore
      ? ""
      : "LEFT JOIN users u ON u.id = a.creato_da";

    const [rows] = (await pool.execute(
      `SELECT ${selectFields} FROM allenamenti a ${join} ${where}
       ORDER BY a.data DESC LIMIT ${limitN} OFFSET ${offsetN}`,
      params
    )) as [any[], any];

    return res.json({ items: rows });
  } catch (e: any) {
    logger.error({ err: e }, "GET allenamenti error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/allenamenti/:id
router.get("/allenamenti/:id", requireAuth, async (req, res) => {
  const { userId, societyId, role } = req.jwtUser!;
  const isGenitore = RUOLI_GENITORE.has(role);
  const { id } = req.params;

  try {
    const [rows] = (await pool.execute(
      `SELECT a.*, CONCAT(u.nome, ' ', u.cognome) AS creato_da_nome
       FROM allenamenti a LEFT JOIN users u ON u.id = a.creato_da
       WHERE a.id = ? AND a.societa_id = ?`,
      [id, societyId]
    )) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const all = rows[0];

    if (isGenitore) {
      if (!all.visibilita_genitori) return res.status(403).json({ error: "forbidden" });
      const diffMs = Date.now() - new Date(all.created_at).getTime();
      if (diffMs < 24 * 60 * 60 * 1000) return res.status(403).json({ error: "non_ancora_visibile" });
      const [cnt] = (await pool.execute(
        "SELECT COUNT(*) AS num_sessioni FROM allenamento_sessioni WHERE allenamento_id = ?", [id]
      )) as [any[], any];
      return res.json({ id: all.id, titolo: all.titolo, obiettivo: all.obiettivo, data: all.data, durata_totale_minuti: all.durata_totale_minuti, num_sessioni: cnt[0].num_sessioni });
    }

    // Staff: restituisce tutto
    const [sessioni] = (await pool.execute(
      `SELECT id, sessione_libreria_id, ordine, titolo_snapshot, descrizione_snapshot,
              durata_minuti_snapshot, categoria_snapshot, tag_snapshot, created_at
       FROM allenamento_sessioni WHERE allenamento_id = ? ORDER BY ordine ASC`,
      [id]
    )) as [any[], any];

    const [noteVocali] = (await pool.execute(
      `SELECT anv.id, anv.url_audio, anv.durata_secondi, anv.momento, anv.created_at,
              CONCAT(u.nome, ' ', u.cognome) AS creato_da_nome
       FROM allenamento_note_vocali anv
       LEFT JOIN users u ON u.id = anv.creato_da
       WHERE anv.allenamento_id = ? ORDER BY anv.created_at ASC`,
      [id]
    )) as [any[], any];

    return res.json({
      ...all,
      sessioni: sessioni.map(s => ({ ...s, tag_snapshot: s.tag_snapshot ?? [] })),
      note_vocali: noteVocali,
    });
  } catch (e: any) {
    logger.error({ err: e }, "GET allenamento/:id error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/allenamenti
router.post("/allenamenti", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const { leva_id, titolo, obiettivo, data, visibilita_genitori = false, note_testo, sessioni = [] } =
    req.body as Record<string, any>;

  if (!leva_id || !titolo || !data)
    return res.status(400).json({ error: "campi_obbligatori_mancanti", message: "leva_id, titolo, data richiesti" });
  if (typeof titolo !== "string" || titolo.length < 3 || titolo.length > 200)
    return res.status(400).json({ error: "titolo_non_valido" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data))
    return res.status(400).json({ error: "data_non_valida", message: "Formato YYYY-MM-DD" });
  if (!Array.isArray(sessioni))
    return res.status(400).json({ error: "sessioni_non_valide" });

  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    const allenamentoId = randomUUID();
    await conn.execute(
      `INSERT INTO allenamenti (id, leva_id, societa_id, creato_da, titolo, obiettivo, data, visibilita_genitori, note_testo, durata_totale_minuti)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [allenamentoId, parseInt(leva_id), societyId, userId, titolo, obiettivo ?? null, data, visibilita_genitori ? 1 : 0, note_testo ?? null]
    );

    const sessioniCreate: any[] = [];
    for (let i = 0; i < sessioni.length; i++) {
      const s = sessioni[i];
      const sessioneId = randomUUID();
      let snap: any;

      if (s.sessione_libreria_id) {
        snap = await snapshotDaLibreria(conn, s.sessione_libreria_id, userId);
        if (!snap) {
          await conn.rollback();
          return res.status(404).json({ error: "sessione_libreria_non_trovata", id: s.sessione_libreria_id });
        }
      } else {
        if (!s.titolo || !s.descrizione || !s.durata_minuti || !s.categoria) {
          await conn.rollback();
          return res.status(400).json({ error: "sessione_manuale_incompleta", index: i });
        }
        snap = { titolo: s.titolo, descrizione: s.descrizione, durata_minuti: parseInt(s.durata_minuti), categoria: s.categoria, tag: s.tag ?? [] };
      }

      const tagSnap = Array.isArray(snap.tag) ? snap.tag : [];
      await conn.execute(
        `INSERT INTO allenamento_sessioni
           (id, allenamento_id, sessione_libreria_id, ordine, titolo_snapshot, descrizione_snapshot,
            durata_minuti_snapshot, categoria_snapshot, tag_snapshot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessioneId, allenamentoId, s.sessione_libreria_id ?? null, i + 1,
         snap.titolo, snap.descrizione, snap.durata_minuti, snap.categoria,
         tagSnap.length ? JSON.stringify(tagSnap) : null]
      );

      if (s.sessione_libreria_id) {
        await conn.execute(
          "UPDATE sessioni_libreria SET usata_count = usata_count + 1 WHERE id = ?",
          [s.sessione_libreria_id]
        );
      }
      sessioniCreate.push({ id: sessioneId, ordine: i + 1, ...snap });
    }

    await ricalcolaDurata(conn, allenamentoId);
    await conn.commit();

    const [rows] = (await pool.execute("SELECT * FROM allenamenti WHERE id = ?", [allenamentoId])) as [any[], any];
    return res.status(201).json({ ...rows[0], sessioni: sessioniCreate });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "POST allenamenti error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// PATCH /api/v2/allenamenti/:id
router.patch("/allenamenti/:id", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { id }        = req.params;

  try {
    const [existing] = (await pool.execute(
      "SELECT id FROM allenamenti WHERE id = ? AND societa_id = ?", [id, societyId]
    )) as [any[], any];
    if (!existing.length) return res.status(404).json({ error: "not_found" });

    const { titolo, obiettivo, data, visibilita_genitori, note_testo } = req.body as Record<string, any>;
    const updates: string[] = [];
    const params: any[]     = [];

    if (titolo !== undefined)             { updates.push("titolo = ?");              params.push(titolo); }
    if (obiettivo !== undefined)          { updates.push("obiettivo = ?");           params.push(obiettivo ?? null); }
    if (data !== undefined)               { updates.push("data = ?");                params.push(data); }
    if (visibilita_genitori !== undefined){ updates.push("visibilita_genitori = ?"); params.push(visibilita_genitori ? 1 : 0); }
    if (note_testo !== undefined)         { updates.push("note_testo = ?");          params.push(note_testo ?? null); }

    if (!updates.length) return res.status(400).json({ error: "nessun_campo_da_aggiornare" });

    params.push(id);
    await pool.execute(`UPDATE allenamenti SET ${updates.join(", ")} WHERE id = ?`, params);
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PATCH allenamenti error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/allenamenti/:id
router.delete("/allenamenti/:id", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { id }        = req.params;

  try {
    const [result] = (await pool.execute(
      "DELETE FROM allenamenti WHERE id = ? AND societa_id = ?", [id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.status(204).send();
  } catch (e: any) {
    logger.error({ err: e }, "DELETE allenamento error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/allenamenti/:id/sessioni/riordina  (prima di /:id/sessioni/:sessioneId)
router.post("/allenamenti/:id/sessioni/riordina", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { id }        = req.params;
  const { ordini }    = req.body as { ordini?: Array<{ sessione_id: string; ordine: number }> };

  if (!Array.isArray(ordini) || !ordini.length)
    return res.status(400).json({ error: "ordini_richiesti" });

  const conn = await (pool as any).getConnection();
  try {
    const [check] = (await conn.execute(
      "SELECT id FROM allenamenti WHERE id = ? AND societa_id = ?", [id, societyId]
    )) as [any[], any];
    if (!check.length) { conn.release(); return res.status(404).json({ error: "not_found" }); }

    await conn.beginTransaction();
    for (const o of ordini) {
      await conn.execute(
        "UPDATE allenamento_sessioni SET ordine = ? WHERE id = ? AND allenamento_id = ?",
        [o.ordine, o.sessione_id, id]
      );
    }
    await conn.commit();
    return res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "POST sessioni/riordina error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// POST /api/v2/allenamenti/:id/sessioni
router.post("/allenamenti/:id/sessioni", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId, societyId } = req.jwtUser!;
  const { id }                = req.params;
  const { sessione_libreria_id, titolo, descrizione, durata_minuti, categoria, tag, ordine, note_snapshot } =
    req.body as Record<string, any>;

  const conn = await (pool as any).getConnection();
  try {
    const [check] = (await conn.execute(
      "SELECT id FROM allenamenti WHERE id = ? AND societa_id = ?", [id, societyId]
    )) as [any[], any];
    if (!check.length) { conn.release(); return res.status(404).json({ error: "not_found" }); }

    await conn.beginTransaction();

    let snap: any;
    if (sessione_libreria_id) {
      snap = await snapshotDaLibreria(conn, sessione_libreria_id, userId);
      if (!snap) {
        await conn.rollback(); conn.release();
        return res.status(404).json({ error: "sessione_libreria_non_trovata" });
      }
    } else {
      if (!titolo || !descrizione || !durata_minuti || !categoria) {
        await conn.rollback(); conn.release();
        return res.status(400).json({ error: "campi_sessione_obbligatori" });
      }
      snap = { titolo, descrizione, durata_minuti: parseInt(durata_minuti), categoria, tag: tag ?? [], note: null };
    }

    // Determina ordine
    let newOrdine: number;
    if (ordine !== undefined) {
      newOrdine = parseInt(ordine);
      // Shifta le sessioni esistenti con ordine >= newOrdine
      await conn.execute(
        "UPDATE allenamento_sessioni SET ordine = ordine + 1 WHERE allenamento_id = ? AND ordine >= ?",
        [id, newOrdine]
      );
    } else {
      const [maxRow] = (await conn.execute(
        "SELECT COALESCE(MAX(ordine), 0) AS maxOrd FROM allenamento_sessioni WHERE allenamento_id = ?", [id]
      )) as [any[], any];
      newOrdine = (maxRow[0].maxOrd as number) + 1;
    }

    const sessioneId = randomUUID();
    const tagSnap = Array.isArray(snap.tag) ? snap.tag : [];
    const noteSnap = (typeof note_snapshot === "string" && note_snapshot.trim())
      ? note_snapshot.trim()
      : (snap.note ?? null);
    await conn.execute(
      `INSERT INTO allenamento_sessioni
         (id, allenamento_id, sessione_libreria_id, ordine, titolo_snapshot, descrizione_snapshot,
          durata_minuti_snapshot, categoria_snapshot, tag_snapshot, note_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessioneId, id, sessione_libreria_id ?? null, newOrdine,
       snap.titolo, snap.descrizione, snap.durata_minuti, snap.categoria,
       tagSnap.length ? JSON.stringify(tagSnap) : null, noteSnap]
    );

    if (sessione_libreria_id) {
      await conn.execute(
        "UPDATE sessioni_libreria SET usata_count = usata_count + 1 WHERE id = ?",
        [sessione_libreria_id]
      );
    }

    await ricalcolaDurata(conn, id);
    await conn.commit();

    const [rows] = (await pool.execute(
      "SELECT * FROM allenamento_sessioni WHERE id = ?", [sessioneId]
    )) as [any[], any];
    return res.status(201).json({ ...rows[0], tag_snapshot: rows[0].tag_snapshot ?? [] });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "POST allenamenti sessioni error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// PATCH /api/v2/allenamenti/:id/sessioni/:sessioneId
router.patch("/allenamenti/:id/sessioni/:sessioneId", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { societyId }   = req.jwtUser!;
  const { id, sessioneId } = req.params;

  const conn = await (pool as any).getConnection();
  try {
    const [check] = (await conn.execute(
      `SELECT als.id, als.ordine FROM allenamento_sessioni als
       JOIN allenamenti a ON a.id = als.allenamento_id
       WHERE als.id = ? AND als.allenamento_id = ? AND a.societa_id = ?`,
      [sessioneId, id, societyId]
    )) as [any[], any];
    if (!check.length) { conn.release(); return res.status(404).json({ error: "not_found" }); }

    const { titolo_snapshot, descrizione_snapshot, durata_minuti_snapshot, categoria_snapshot, tag_snapshot, note_snapshot, ordine } =
      req.body as Record<string, any>;
    const updates: string[] = [];
    const params: any[]     = [];

    if (titolo_snapshot !== undefined)        { updates.push("titolo_snapshot = ?");        params.push(titolo_snapshot); }
    if (descrizione_snapshot !== undefined)   { updates.push("descrizione_snapshot = ?");   params.push(descrizione_snapshot); }
    if (durata_minuti_snapshot !== undefined) { updates.push("durata_minuti_snapshot = ?"); params.push(parseInt(durata_minuti_snapshot)); }
    if (categoria_snapshot !== undefined)     { updates.push("categoria_snapshot = ?");     params.push(categoria_snapshot); }
    if (tag_snapshot !== undefined)           { updates.push("tag_snapshot = ?");           params.push(JSON.stringify(tag_snapshot)); }
    if (note_snapshot !== undefined)          { updates.push("note_snapshot = ?");          params.push((typeof note_snapshot === "string" && note_snapshot.trim()) ? note_snapshot.trim() : null); }

    await conn.beginTransaction();

    if (ordine !== undefined) {
      const newOrdine    = parseInt(ordine);
      const currentOrdine = check[0].ordine as number;
      if (newOrdine !== currentOrdine) {
        if (newOrdine > currentOrdine) {
          await conn.execute(
            "UPDATE allenamento_sessioni SET ordine = ordine - 1 WHERE allenamento_id = ? AND ordine > ? AND ordine <= ?",
            [id, currentOrdine, newOrdine]
          );
        } else {
          await conn.execute(
            "UPDATE allenamento_sessioni SET ordine = ordine + 1 WHERE allenamento_id = ? AND ordine >= ? AND ordine < ?",
            [id, newOrdine, currentOrdine]
          );
        }
        updates.push("ordine = ?"); params.push(newOrdine);
      }
    }

    if (updates.length) {
      params.push(sessioneId);
      await conn.execute(`UPDATE allenamento_sessioni SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    await ricalcolaDurata(conn, id);
    await conn.commit();
    return res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "PATCH allenamento sessione error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// DELETE /api/v2/allenamenti/:id/sessioni/:sessioneId
router.delete("/allenamenti/:id/sessioni/:sessioneId", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { societyId }      = req.jwtUser!;
  const { id, sessioneId } = req.params;

  const conn = await (pool as any).getConnection();
  try {
    const [check] = (await conn.execute(
      `SELECT als.id FROM allenamento_sessioni als
       JOIN allenamenti a ON a.id = als.allenamento_id
       WHERE als.id = ? AND als.allenamento_id = ? AND a.societa_id = ?`,
      [sessioneId, id, societyId]
    )) as [any[], any];
    if (!check.length) { conn.release(); return res.status(404).json({ error: "not_found" }); }

    await conn.beginTransaction();
    await conn.execute("DELETE FROM allenamento_sessioni WHERE id = ?", [sessioneId]);
    await compattaOrdini(conn, id);
    await ricalcolaDurata(conn, id);
    await conn.commit();
    return res.status(204).send();
  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "DELETE allenamento sessione error");
    return res.status(500).json({ error: "server_error" });
  } finally {
    conn.release();
  }
});

// ─── PARTE C: NOTE VOCALI ────────────────────────────────────────────────────

// GET /api/v2/allenamenti/note-vocali/:id/audio  (serve file)
router.get("/allenamenti/note-vocali/:id/audio", requireAuth, async (req, res) => {
  const { userId, societyId, role } = req.jwtUser!;
  const isGenitore = RUOLI_GENITORE.has(role);
  const { id } = req.params;

  try {
    const [rows] = (await pool.execute(
      `SELECT anv.url_audio, a.societa_id, a.visibilita_genitori, a.created_at
       FROM allenamento_note_vocali anv
       JOIN allenamenti a ON a.id = anv.allenamento_id
       WHERE anv.id = ?`,
      [id]
    )) as [any[], any];

    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const row = rows[0];

    if (row.societa_id !== societyId) return res.status(403).json({ error: "forbidden" });
    if (isGenitore) {
      if (!row.visibilita_genitori) return res.status(403).json({ error: "forbidden" });
      if (Date.now() - new Date(row.created_at).getTime() < 24 * 60 * 60 * 1000)
        return res.status(403).json({ error: "non_ancora_visibile" });
    }

    const filePath = path.join(process.cwd(), row.url_audio as string);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "file_non_trovato" });

    const ext = path.extname(filePath).toLowerCase().slice(1);
    res.setHeader("Content-Type", AUDIO_MIME[ext] ?? "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  } catch (e: any) {
    logger.error({ err: e }, "GET nota-vocale audio error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/allenamenti/note-vocali/:id
router.delete("/allenamenti/note-vocali/:id", requireAuth, requirePermission("modifica_piano_allenamento"), async (req, res) => {
  const { userId, societyId, role } = req.jwtUser!;
  const isAdmin = role === "admin" || role === "mister_admin";
  const { id } = req.params;

  try {
    const [rows] = (await pool.execute(
      `SELECT anv.id, anv.creato_da, anv.url_audio, a.societa_id
       FROM allenamento_note_vocali anv
       JOIN allenamenti a ON a.id = anv.allenamento_id
       WHERE anv.id = ?`,
      [id]
    )) as [any[], any];
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const row = rows[0];

    if (row.societa_id !== societyId) return res.status(403).json({ error: "forbidden" });
    if (!isAdmin && row.creato_da !== userId) return res.status(403).json({ error: "forbidden" });

    await pool.execute("DELETE FROM allenamento_note_vocali WHERE id = ?", [id]);

    // Elimina file fisico
    try {
      const filePath = path.join(process.cwd(), row.url_audio as string);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (fe: any) {
      logger.warn({ err: fe }, "DELETE nota-vocale: file non eliminato");
    }

    return res.status(204).send();
  } catch (e: any) {
    logger.error({ err: e }, "DELETE nota-vocale error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/allenamenti/:id/note-vocali  (upload multer)
router.post("/allenamenti/:id/note-vocali", requireAuth, requirePermission("modifica_piano_allenamento"),
  (req, res, next) => uploadAudio.single("audio")(req, res, (err) => {
    if (err) {
      if (err.message === "formato_non_supportato")
        return res.status(400).json({ error: "formato_non_supportato", message: "Formati accettati: m4a, mp3, wav, webm, ogg" });
      if (err.code === "LIMIT_FILE_SIZE")
        return res.status(400).json({ error: "file_troppo_grande", message: "Max 5MB" });
      return res.status(400).json({ error: "upload_error", message: err.message });
    }
    next();
  }),
  async (req, res) => {
    const { userId, societyId } = req.jwtUser!;
    const { id }                = req.params;
    const { momento, durata_secondi } = req.body as Record<string, string>;

    if (!req.file) return res.status(400).json({ error: "file_audio_richiesto" });
    if (!momento || !["durante", "dopo"].includes(momento))
      return res.status(400).json({ error: "momento_non_valido" });
    const durata = parseInt(durata_secondi);
    if (isNaN(durata) || durata <= 0) return res.status(400).json({ error: "durata_non_valida" });

    try {
      const [check] = (await pool.execute(
        "SELECT id FROM allenamenti WHERE id = ? AND societa_id = ?", [id, societyId]
      )) as [any[], any];
      if (!check.length) return res.status(404).json({ error: "allenamento_non_trovato" });

      const relPath = path.join("storage", "note-vocali", id, req.file.filename);
      const notaId  = randomUUID();

      await pool.execute(
        `INSERT INTO allenamento_note_vocali (id, allenamento_id, creato_da, url_audio, durata_secondi, momento)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [notaId, id, userId, relPath, durata, momento]
      );

      return res.status(201).json({
        id: notaId,
        url_audio: "/" + relPath,
        durata_secondi: durata,
        momento,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      logger.error({ err: e }, "POST nota-vocale error");
      return res.status(500).json({ error: "server_error" });
    }
  }
);

export default router;
