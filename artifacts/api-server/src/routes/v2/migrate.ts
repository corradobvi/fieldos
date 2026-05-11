import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole, hashPassword } from "../../lib/auth";

const router = Router();

interface BlobUser {
  id: number; nome: string; cogn: string; email: string; pass: string;
  role: string; leva?: string; stato?: string; tempPassword?: boolean;
  figli?: string[]; figlio?: string;
}

interface BlobPlayer {
  id: number; nome: string; cogn: string; sopran?: string; numero?: number;
  ruolo?: string; anno?: number; leva?: string; telGenitore?: string;
  emailGenitore?: string; note?: string;
}

interface BlobEvent {
  id: number; type: string; title?: string; leva?: string; luogo?: string;
  date?: string; start?: string; end?: string; endDate?: string;
  note?: string; recurring?: boolean; freq?: string; days?: string; until?: string;
}

interface BlobMsg {
  id: number; autoreId?: number; testo?: string; text?: string;
  foto?: string; ts?: string; date?: string;
}

interface BlobComm {
  id: number; tipo?: string; titolo?: string; testo?: string; text?: string;
  bacheca?: string; leva?: string; urgente?: boolean; userId?: number;
  date?: string;
}

// POST /api/v2/migrate — importa blob JSON legacy nelle nuove tabelle
// Richiede autenticazione admin. Può essere chiamato più volte (idempotente tramite INSERT IGNORE).
router.post("/migrate", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const blob = req.body as Record<string, any>;

  if (!blob || typeof blob !== "object") {
    return res.status(400).json({ error: "body_must_be_blob_json" });
  }

  const report: Record<string, number> = {};
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ── Society settings ──────────────────────────────────────────
    if (blob.nomeSocieta || blob.coloriPrimari) {
      await conn.execute(
        `UPDATE societies SET
          nome            = COALESCE(?, nome),
          colore_primario = COALESCE(?, colore_primario),
          colore_accento  = COALESCE(?, colore_accento),
          codice          = COALESCE(NULLIF(?, ''), codice)
         WHERE id = ?`,
        [blob.nomeSocieta ?? null, blob.coloriPrimari ?? null,
         blob.coloriAccento ?? null, blob.codiceSocieta ?? null, societyId]
      );
    }

    // ── Leve ─────────────────────────────────────────────────────
    let leveCount = 0;
    if (Array.isArray(blob.leve)) {
      for (const l of blob.leve as string[]) {
        if (!l?.trim()) continue;
        await conn.execute(
          "INSERT IGNORE INTO leve (society_id, nome) VALUES (?, ?)",
          [societyId, l.trim()]
        );
        leveCount++;
      }
    }
    report.leve = leveCount;

    // ── Users ─────────────────────────────────────────────────────
    const userIdMap = new Map<number, number>(); // blobId → newDbId
    let usersCount = 0;
    if (Array.isArray(blob.USERS_DB)) {
      for (const u of blob.USERS_DB as BlobUser[]) {
        if (!u.email || !u.nome) continue;
        const normalEmail = u.email.toLowerCase().trim();
        const figli: string[] = Array.isArray(u.figli) ? u.figli : (u.figlio ? [u.figlio] : []);
        const roleMap: Record<string, string> = {
          admin: "admin", allenatore: "allenatore", dirigente: "dirigente",
          genitore: "genitore", nonno: "nonno", giocatore: "giocatore"
        };
        const ruolo = roleMap[u.role] ?? "genitore";

        // Hash password if plain text (legacy system stores plain text)
        const pwdHash = u.pass && !u.pass.includes(":") ? hashPassword(u.pass) : (u.pass ?? hashPassword("changeme"));

        try {
          const [existing] = (await conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
            [normalEmail, societyId]
          )) as [any[], any];

          let dbId: number;
          if (existing.length) {
            dbId = existing[0].id;
            await conn.execute(
              "UPDATE users SET nome = ?, cognome = ?, ruolo = ?, leva = ?, stato = ?, figli = ?, temp_password = ? WHERE id = ?",
              [u.nome, u.cogn ?? "", ruolo, u.leva ?? null,
               u.stato === "sospeso" ? "sospeso" : "attivo",
               figli.length ? JSON.stringify(figli) : null,
               u.tempPassword ? 1 : 0, dbId]
            );
          } else {
            const [ins] = (await conn.execute(
              "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, stato, figli, temp_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [societyId, u.nome, u.cogn ?? "", normalEmail, pwdHash, ruolo,
               u.leva ?? null, u.stato === "sospeso" ? "sospeso" : "attivo",
               figli.length ? JSON.stringify(figli) : null,
               u.tempPassword ? 1 : 0]
            )) as [any, any];
            dbId = ins.insertId;
            usersCount++;
          }
          userIdMap.set(u.id, dbId);
        } catch (e: any) {
          logger.warn({ email: normalEmail, err: e?.message }, "migrate: skip user");
        }
      }
    }
    report.users = usersCount;

    // ── Players ───────────────────────────────────────────────────
    const playerIdMap = new Map<number, number>();
    let playersCount = 0;
    if (Array.isArray(blob.players)) {
      for (const p of blob.players as BlobPlayer[]) {
        if (!p.nome) continue;
        const [existing] = (await conn.execute(
          "SELECT id FROM players WHERE society_id = ? AND nome = ? AND cognome = ? AND COALESCE(leva,'') = COALESCE(?,'') LIMIT 1",
          [societyId, p.nome, p.cogn ?? "", p.leva ?? null]
        )) as [any[], any];

        let dbId: number;
        if (existing.length) {
          dbId = existing[0].id;
        } else {
          const [ins] = (await conn.execute(
            "INSERT INTO players (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita, leva, telefono_genitore, email_genitore, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [societyId, p.nome, p.cogn ?? "", p.sopran ?? null, p.numero ?? null,
             p.ruolo ?? null, p.anno ?? null, p.leva ?? null,
             p.telGenitore ?? null, p.emailGenitore ?? null, p.note ?? null]
          )) as [any, any];
          dbId = ins.insertId;
          playersCount++;
        }
        playerIdMap.set(p.id, dbId);
      }
    }
    report.players = playersCount;

    // ── Events ────────────────────────────────────────────────────
    const eventIdMap = new Map<number, number>();
    let eventsCount = 0;
    if (Array.isArray(blob.events)) {
      for (const e of blob.events as BlobEvent[]) {
        if (!e.type) continue;
        const typeMap: Record<string, string> = {
          allenamento: "allenamento", partita: "partita", campionato: "partita",
          torneo: "torneo", altro: "altro", allenamento_portieri: "allenamento"
        };
        const tipo = typeMap[e.type] ?? e.type;
        const titolo = e.title ?? tipo;

        const [ins] = (await conn.execute(
          "INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [societyId, tipo, titolo, e.leva ?? null, e.luogo ?? null,
           e.date ?? null, e.start ?? null, e.endDate ?? null, e.end ?? null,
           e.note ?? null, e.recurring ? 1 : 0,
           e.freq ?? null, e.days ?? null, e.until ?? null]
        )) as [any, any];
        eventIdMap.set(e.id, ins.insertId);
        eventsCount++;
      }
    }
    report.events = eventsCount;

    // ── Comunicazioni ─────────────────────────────────────────────
    let commCount = 0;
    if (Array.isArray(blob.comunicazioni)) {
      for (const c of blob.comunicazioni as BlobComm[]) {
        const body = c.testo ?? c.text ?? "";
        if (!body) continue;
        const authorDbId = c.userId ? (userIdMap.get(c.userId) ?? null) : null;
        await conn.execute(
          "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [societyId, authorDbId, c.tipo ?? "comunicazione", c.titolo ?? null, body,
           c.bacheca ?? "generale", c.leva ?? null, c.urgente ? 1 : 0,
           c.date ? new Date(c.date) : new Date()]
        );
        commCount++;
      }
    }
    report.comunicazioni = commCount;

    // ── Chat messages ─────────────────────────────────────────────
    let chatCount = 0;
    if (blob.chatMessaggi && typeof blob.chatMessaggi === "object") {
      for (const [chatId, messages] of Object.entries(blob.chatMessaggi)) {
        if (!Array.isArray(messages)) continue;
        for (const m of messages as BlobMsg[]) {
          const testo = m.testo ?? m.text ?? "";
          const authorDbId = m.autoreId ? (userIdMap.get(m.autoreId) ?? null) : null;
          await conn.execute(
            "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [societyId, chatId, authorDbId, testo || null, m.foto ?? null,
             m.ts ? new Date(m.ts) : (m.date ? new Date(m.date) : new Date())]
          );
          chatCount++;
        }
      }
    }
    report.chatMessages = chatCount;

    await conn.commit();
    logger.info({ societyId, report }, "v2 migrate: completed");
    return res.json({ ok: true, report });

  } catch (e: any) {
    await conn.rollback();
    logger.error({ err: e }, "v2 migrate error");
    return res.status(500).json({ error: "migrate_failed", detail: e?.message });
  } finally {
    conn.release();
  }
});

export default router;
