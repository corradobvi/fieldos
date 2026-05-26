import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret = req.headers["x-sa-secret"];
  const saSecret = process.env.SA_SECRET ?? "super123";
  if (secret !== saSecret) { res.status(401).json({ error: "unauthorized" }); return false; }
  return true;
}

// GET /api/v2/superadmin/_diag/genitore-debug?societyId=38
router.get("/superadmin/_diag/genitore-debug", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const societyId = parseInt(String(req.query.societyId || '38'));
  try {
    const [society] = await pool.execute(
      `SELECT id, nome, codice, billing_mode, piano, subscription_status FROM societies WHERE id = ?`, [societyId]
    ) as [any[], any];

    const [players] = await pool.execute(
      `SELECT id, nome, cognome, cognome_iniziale, leva, numero, incomplete, approval_status,
              birth_date, society_id, created_at
       FROM players WHERE society_id = ? ORDER BY id`, [societyId]
    ) as [any[], any];

    const [users] = await pool.execute(
      `SELECT id, email, ruolo, society_id, nome, cognome, created_at, privacy_accepted_at
       FROM users WHERE society_id = ? ORDER BY id`, [societyId]
    ) as [any[], any];

    const [guardians] = await pool.execute(
      `SELECT pg.id, pg.player_id, pg.user_id, pg.role, pg.consent_given, pg.consent_at,
              u.email AS u_email, u.nome AS u_nome, u.cognome AS u_cogn, u.ruolo AS u_ruolo,
              p.nome AS p_nome, p.cognome AS p_cogn, p.cognome_iniziale AS p_cogn_ini
       FROM player_guardians pg
       LEFT JOIN users u ON u.id = pg.user_id
       LEFT JOIN players p ON p.id = pg.player_id
       WHERE pg.player_id IN (SELECT id FROM players WHERE society_id = ?)
       ORDER BY pg.id DESC`, [societyId]
    ) as [any[], any];

    const [userPlayers] = await pool.execute(
      `SELECT up.user_id, up.player_id, u.email AS u_email, p.nome AS p_nome
       FROM user_players up
       LEFT JOIN users u ON u.id = up.user_id
       LEFT JOIN players p ON p.id = up.player_id
       WHERE up.player_id IN (SELECT id FROM players WHERE society_id = ?)
       ORDER BY up.user_id DESC`, [societyId]
    ) as [any[], any];

    // Blob state per la stessa società
    const stateKey = `fieldos_state_soc_${societyId}`;
    const [blobRows] = await pool.execute(
      `SELECT \`key\`, CHAR_LENGTH(state_json) AS bytes, updated_at FROM society_state WHERE \`key\` = ?`,
      [stateKey]
    ) as [any[], any];
    let blobPlayers: any[] = [];
    let blobUsers: any[] = [];
    let blobCodice: string | null = null;
    if (blobRows.length) {
      const [r] = await pool.execute(`SELECT state_json FROM society_state WHERE \`key\` = ?`, [stateKey]) as [any[], any];
      try {
        const state = JSON.parse(r[0].state_json);
        blobCodice = state.codiceSocieta || null;
        blobPlayers = (state.players || []).map((p: any) => ({
          id: p.id, nome: p.nome, cogn: p.cogn, cogn_iniziale: p.cogn_iniziale,
          leva: p.leva, num: p.num, incomplete: p.incomplete,
          approval_status: p.approval_status, birth_date: p.birth_date,
        }));
        blobUsers = (state.USERS_DB || []).map((u: any) => ({
          id: u.id, email: u.email, role: u.role, nome: u.nome, cogn: u.cogn,
          figli: u.figli, figliIds: u.figliIds, titoloFamiliare: u.titoloFamiliare,
          stato: u.stato,
          has_pass:        !!u.pass,
          pass_len:        u.pass ? String(u.pass).length : 0,
          has_pwd_hash:    !!u.password_hash,
          _isV2:           u._isV2 || false,
        }));
      } catch (_) {}
    }

    return res.json({
      society: society[0] || null,
      mysql: { players, users, guardians, user_players: userPlayers },
      blob: { meta: blobRows[0] || null, codiceSocieta: blobCodice, players: blobPlayers, users: blobUsers },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
