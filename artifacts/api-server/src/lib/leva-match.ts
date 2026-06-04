// Helpers condivisi per il matching della leva tra il chat resolver
// (_resolveChatRecipients in routes/v2/chat.ts) e il push-sender generico
// (getUsersForPush in lib/push-sender.ts). DRY-out di logica gia' battle-tested
// su chat per renderla disponibile anche al flusso parent-link / comunicazioni.

// Estrae i prefissi della leva rispetto ai separatori comuni (en-dash, hyphen,
// em-dash circondati da spazi). Serve perche' renameLeva FE aggiorna solo blob
// + USERS_DB.leva ma NON propaga a users.leva su MySQL: dopo un rename
// 'U11' → 'U11 – Pulcini' la chat_id e' 'staff_U11 – Pulcini' (dal blob) ma
// users.leva in MySQL resta 'U11' → senza prefix-extraction nessun match.
export function _levaPrefixes(leva: string): string[] {
  const out = new Set<string>([leva]);
  for (const sep of [" – ", " - ", " — "]) {
    const idx = leva.indexOf(sep);
    if (idx > 0) out.add(leva.substring(0, idx).trim());
  }
  return Array.from(out).filter(s => s.length > 0);
}

// Clausola SQL per il match leva (collaboratori non-admin). Restituisce {sql, params}.
// Copre: exact match, prefix-extracted stored (3 separatori), null/empty/Tutte,
// JSON-array contains. Additivo: non rimuove match esistenti.
export function _levaMatchClause(leva: string): { sql: string; params: any[] } {
  const targets = _levaPrefixes(leva);
  const inPh = targets.map(() => "?").join(",");
  const jsonOr = targets.map(() => "JSON_CONTAINS(leva, JSON_QUOTE(?))").join(" OR ");
  const sql = `(
    leva IN (${inPh})
    OR SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(leva, ' – ', 1), ' - ', 1), ' — ', 1) IN (${inPh})
    OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'
    OR (JSON_VALID(leva) AND (${jsonOr}))
  )`;
  return { sql, params: [...targets, ...targets, ...targets] };
}
