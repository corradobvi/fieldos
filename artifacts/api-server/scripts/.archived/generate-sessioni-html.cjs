'use strict';
// Generator: 420 HTML "Quaderno Tecnico" per sessioni ufficiali MyVivaio
// Legge i 6 file SQL seed, parsa gli INSERT, scrive HTML + manifest JSON.
// NESSUNA dipendenza esterna — solo Node.js built-in.

const fs   = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');
const OUT_DIR        = path.resolve(__dirname, '../../fieldos/sessioni-ufficiali');

// ── Lookup tables ─────────────────────────────────────────────────────────────
const ETA_META = {
  primi_calci:  { label: 'Primi Calci · U6-U7',    folder: 'primi-calci'   },
  pulcini:      { label: 'Pulcini · U8-U10',         folder: 'pulcini'       },
  esordienti:   { label: 'Esordienti · U11-U12',     folder: 'esordienti'    },
  giovanissimi: { label: 'Giovanissimi · U13-U14',   folder: 'giovanissimi'  },
  allievi:      { label: 'Allievi · U15-U16',        folder: 'allievi'       },
  juniores:     { label: 'Juniores · U17-U19',       folder: 'juniores'      },
};

const CATEGORIA_META = {
  riscaldamento:        { label: 'Riscaldamento'        },
  tecnica_individuale:  { label: 'Tecnica individuale'  },
  tattica:              { label: 'Tattica'               },
  possesso_palla:       { label: 'Possesso palla'        },
  finalizzazione:       { label: 'Finalizzazione'        },
  atletica_fisico:      { label: 'Atletica e fisico'     },
  portieri:             { label: 'Portieri'               },
};

const MATERIALE = {
  riscaldamento:        '1 pallone per coppia, casacche',
  tecnica_individuale:  '1 pallone per giocatore, 4-6 cinesini',
  tattica:              'Palloni, 8-12 cinesini, casacche di 2 colori',
  possesso_palla:       '1 pallone, cinesini per delimitare zone, casacche',
  finalizzazione:       'Palloni, porte, casacche',
  atletica_fisico:      'Cinesini, scaletta (se disponibile), cronometro',
  portieri:             '2-3 palloni, porta, eventuali ostacoli',
};

const NOTA_ETA = {
  primi_calci:  'Tono ludico, tutti devono divertirsi. NO agonismo.',
  pulcini:      'Incoraggiare il dialogo tra compagni e l\'autonomia.',
  esordienti:   'Bilanciare gioco e principi tecnici di base.',
  giovanissimi: 'Introdurre concetti tattici progressivi.',
  allievi:      'Lavoro tecnico-tattico più strutturato, attenzione ai dettagli.',
  juniores:     'Massima intensità e cura dei principi di squadra.',
};

// ── SVG templates (uno per categoria) ─────────────────────────────────────────
const SVG = {
  riscaldamento: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- cerchio centrale -->
  <ellipse cx="140" cy="120" rx="52" ry="52" fill="none" stroke="white" stroke-width="1.5" stroke-dasharray="5,3"/>
  <circle cx="140" cy="120" r="3" fill="white"/>
  <!-- 6 giocatori stellati -->
  <circle cx="140" cy="60" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="140" y="64" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">1</text>
  <circle cx="187" cy="88" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="187" y="92" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">2</text>
  <circle cx="187" cy="152" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="187" y="156" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">3</text>
  <circle cx="140" cy="180" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="140" y="184" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">4</text>
  <circle cx="93" cy="152" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="93" y="156" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">5</text>
  <circle cx="93" cy="88" r="9" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="93" y="92" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">6</text>
  <!-- pallone -->
  <circle cx="140" cy="120" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">RISCALDAMENTO</text>
</svg>`,

  tecnica_individuale: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- linea di percorso -->
  <line x1="40" y1="120" x2="240" y2="120" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- 5 cinesini (triangoli gialli) -->
  <polygon points="80,108 73,125 87,125" fill="#f9e04b"/>
  <polygon points="120,108 113,125 127,125" fill="#f9e04b"/>
  <polygon points="160,108 153,125 167,125" fill="#f9e04b"/>
  <polygon points="200,108 193,125 207,125" fill="#f9e04b"/>
  <polygon points="240,108 233,125 247,125" fill="#f9e04b"/>
  <!-- giocatore con palla -->
  <circle cx="40" cy="106" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="40" y="110" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">1</text>
  <circle cx="52" cy="122" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <!-- freccia direzione -->
  <path d="M58 120 L75 120" stroke="white" stroke-width="1.5" marker-end="url(#ar)"/>
  <defs><marker id="ar" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
    <path d="M0,0 L6,3 L0,6 Z" fill="white"/>
  </marker></defs>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">TECNICA INDIVIDUALE</text>
</svg>`,

  tattica: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- linea metà campo -->
  <line x1="140" y1="20" x2="140" y2="220" stroke="white" stroke-width="1" stroke-dasharray="5,4" opacity=".5"/>
  <!-- squadra bianca -->
  <circle cx="70" cy="80" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="70" y="84" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <circle cx="70" cy="120" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="70" y="124" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <circle cx="70" cy="160" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="70" y="164" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <!-- squadra nera -->
  <circle cx="210" cy="80" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="210" y="84" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <circle cx="210" cy="120" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="210" y="124" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <circle cx="210" cy="160" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="210" y="164" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <!-- frecce di movimento -->
  <path d="M80 116 Q110 90 130 100" stroke="#f9e04b" stroke-width="1.5" fill="none" stroke-dasharray="4,2"/>
  <path d="M80 124 Q110 150 130 140" stroke="#f9e04b" stroke-width="1.5" fill="none" stroke-dasharray="4,2"/>
  <!-- pallone -->
  <circle cx="140" cy="120" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">TATTICA 3v3</text>
</svg>`,

  possesso_palla: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <!-- 4 zone -->
  <line x1="140" y1="20" x2="140" y2="220" stroke="white" stroke-width="1" opacity=".4"/>
  <line x1="20" y1="120" x2="260" y2="120" stroke="white" stroke-width="1" opacity=".4"/>
  <rect x="20" y="20" width="264" height="200" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- cinesini angoli zone -->
  <polygon points="140,20 136,28 144,28" fill="#f9e04b"/>
  <polygon points="140,220 136,212 144,212" fill="#f9e04b"/>
  <polygon points="20,120 28,116 28,124" fill="#f9e04b"/>
  <polygon points="260,120 252,116 252,124" fill="#f9e04b"/>
  <!-- 3 giocatori bianchi -->
  <circle cx="75" cy="80" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="75" y="84" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <circle cx="200" cy="155" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="200" y="159" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <circle cx="190" cy="75" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="190" y="79" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">B</text>
  <!-- 3 giocatori neri -->
  <circle cx="75" cy="160" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="75" y="164" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <circle cx="175" cy="80" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="175" y="84" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <circle cx="85" cy="155" r="10" fill="#2D3748" stroke="white" stroke-width="1.5"/>
  <text x="85" y="159" text-anchor="middle" font-size="9" fill="white" font-weight="700">N</text>
  <!-- pallone -->
  <circle cx="130" cy="110" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">POSSESSO PALLA</text>
</svg>`,

  finalizzazione: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- porta -->
  <rect x="100" y="18" width="80" height="28" fill="none" stroke="white" stroke-width="2"/>
  <!-- portiere -->
  <circle cx="140" cy="28" r="8" fill="#f9e04b" stroke="white" stroke-width="1.5"/>
  <text x="140" y="32" text-anchor="middle" font-size="8" fill="#1A7A4A" font-weight="700">P</text>
  <!-- sequenza coni -->
  <polygon points="80,160 75,172 85,172" fill="#f9e04b"/>
  <polygon points="110,145 105,157 115,157" fill="#f9e04b"/>
  <polygon points="140,135 135,147 145,147" fill="#f9e04b"/>
  <!-- traiettoria tiro -->
  <path d="M80,170 Q110,100 140,46" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="6,3"/>
  <!-- giocatore tiratore -->
  <circle cx="65" cy="185" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="65" y="189" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">1</text>
  <!-- pallone -->
  <circle cx="80" cy="172" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">FINALIZZAZIONE</text>
</svg>`,

  atletica_fisico: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- scaletta a terra (griglia rettangoli) -->
  <g stroke="white" stroke-width="1.5" fill="none" opacity=".9">
    <rect x="40" y="100" width="24" height="40"/>
    <rect x="64" y="100" width="24" height="40"/>
    <rect x="88" y="100" width="24" height="40"/>
    <rect x="112" y="100" width="24" height="40"/>
    <rect x="136" y="100" width="24" height="40"/>
    <rect x="160" y="100" width="24" height="40"/>
    <rect x="184" y="100" width="24" height="40"/>
  </g>
  <!-- giocatore alla partenza -->
  <circle cx="40" cy="80" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="40" y="84" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">1</text>
  <!-- freccia avanzamento -->
  <path d="M52 80 L200 80" stroke="#f9e04b" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- cinesini slalom a destra -->
  <polygon points="230,85 225,100 235,100" fill="#f9e04b"/>
  <polygon points="230,115 225,130 235,130" fill="#f9e04b"/>
  <polygon points="230,145 225,160 235,160" fill="#f9e04b"/>
  <!-- etichette -->
  <text x="115" y="88" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.7)">SCALETTA</text>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">ATLETICA E FISICO</text>
</svg>`,

  portieri: `<svg class="schema-figura" viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="240" fill="#1A7A4A"/>
  <rect x="8" y="8" width="264" height="224" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>
  <!-- porta grande -->
  <rect x="80" y="18" width="120" height="40" fill="none" stroke="white" stroke-width="2.5"/>
  <!-- portiere -->
  <circle cx="140" cy="30" r="11" fill="#f9e04b" stroke="white" stroke-width="1.5"/>
  <text x="140" y="34" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">P</text>
  <!-- area porta punteggiata -->
  <rect x="60" y="18" width="160" height="65" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1" stroke-dasharray="4,3"/>
  <!-- giocatore tiratore -->
  <circle cx="140" cy="185" r="10" fill="white" stroke="#1A7A4A" stroke-width="1.5"/>
  <text x="140" y="189" text-anchor="middle" font-size="9" fill="#1A7A4A" font-weight="700">T</text>
  <!-- cono lanciatore -->
  <polygon points="80,185 74,200 86,200" fill="#f9e04b"/>
  <!-- traiettoria pallone -->
  <path d="M140,175 Q140,120 140,58" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="6,4"/>
  <!-- pallone a metà -->
  <circle cx="140" cy="130" r="5" fill="#f9e04b" stroke="white" stroke-width="1"/>
  <!-- freccia presa portiere -->
  <path d="M140 42 Q130 46 128 50" stroke="#1A7A4A" stroke-width="1.5" fill="none"/>
  <text x="140" y="230" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.6)">PORTIERI</text>
</svg>`,
};

// ── Slug helper ────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // rimuovi accenti
    .replace(/[àáâãäåæ]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n').replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ── SQL parser ────────────────────────────────────────────────────────────────
// Parsa blocchi INSERT ... SELECT UUID(), NULL, NULL, 'titolo', 'desc', ...
function parseSqlFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const sessions = [];

  // Estrai ogni blocco INSERT tra "SELECT UUID(), NULL, NULL," e prima del WHERE NOT EXISTS
  // Il pattern è: SELECT UUID(), NULL, NULL,\n  'titolo',\n  'descrizione',\n  durata, 'categoria', 'eta_leva',\n  JSON_ARRAY(...),...

  // Unisci tutte le righe rimuovendo i newline all'interno dei blocchi SELECT
  // Ma le stringhe SQL multiriga con valori quoted possono contenere newline dentro ''
  // Usiamo un approccio a blocchi: ogni INSERT...WHERE NOT EXISTS è un blocco

  const insertBlocks = content.split(/INSERT INTO sessioni_libreria\s*\([^)]+\)\s*/);
  // insertBlocks[0] è il preambolo, [1..N] sono i blocchi SELECT...

  for (let i = 1; i < insertBlocks.length; i++) {
    const block = insertBlocks[i];
    // Il blocco inizia con "SELECT UUID(), NULL, NULL,"
    // Poi abbiamo: 'titolo', 'descrizione', durata, 'categoria', 'eta_leva', JSON_ARRAY(...), 'pubblica', TRUE, FALSE, 0

    try {
      const parsed = parseSelectBlock(block);
      if (parsed) sessions.push(parsed);
    } catch(e) {
      console.error(`  ⚠ Errore parsing blocco ${i}: ${e.message}`);
    }
  }

  return sessions;
}

// Parsa il SELECT ... block e restituisce {id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag}
// Il blocco ha la forma:
// SELECT UUID(), NULL, NULL,\n  'titolo multiriga',\n  'descrizione multiriga',\n  durata, 'categoria', 'eta_leva',\n  JSON_ARRAY(...), ...
function parseSelectBlock(block) {
  // Trova "SELECT UUID(), NULL, NULL,"
  const selectMatch = /SELECT\s+UUID\(\),\s*NULL,\s*NULL,\s*/i.exec(block);
  if (!selectMatch) return null;

  let pos = selectMatch.index + selectMatch[0].length;
  const rest = block.slice(pos);

  // Estrae le stringhe quoted SQL (gestisce \' e '' come escape)
  function extractString(s, start) {
    if (s[start] !== "'") throw new Error('Expected quote at ' + start + ': ' + s.slice(start, start+20));
    let i = start + 1;
    let result = '';
    while (i < s.length) {
      if (s[i] === "'" && s[i+1] === "'") { result += "'"; i += 2; }
      else if (s[i] === '\\' && s[i+1] === "'") { result += "'"; i += 2; }
      else if (s[i] === "'" ) { return [result, i + 1]; }
      else { result += s[i]; i++; }
    }
    throw new Error('Unterminated string at ' + start);
  }

  function skipWS(s, i) { while (i < s.length && /\s/.test(s[i])) i++; return i; }
  function expectComma(s, i) { i = skipWS(s, i); if (s[i] !== ',') throw new Error('Expected comma at ' + i + ': "' + s.slice(i, i+10) + '"'); return i + 1; }

  let i = 0;
  const s = rest;
  i = skipWS(s, i);

  // titolo
  const [titolo, i1] = extractString(s, i);
  i = expectComma(s, i1);
  i = skipWS(s, i);

  // descrizione
  const [descrizione, i2] = extractString(s, i);
  i = expectComma(s, i2);
  i = skipWS(s, i);

  // durata_minuti (numero)
  const durMatch = /^(\d+)/.exec(s.slice(i));
  if (!durMatch) throw new Error('Expected number for durata at: ' + s.slice(i, i+20));
  const durata_minuti = parseInt(durMatch[1]);
  i += durMatch[1].length;
  i = expectComma(s, i);
  i = skipWS(s, i);

  // categoria
  const [categoria, i3] = extractString(s, i);
  i = expectComma(s, i3);
  i = skipWS(s, i);

  // eta_leva
  const [eta_leva, i4] = extractString(s, i);
  i = expectComma(s, i4);
  i = skipWS(s, i);

  // tag: JSON_ARRAY(...) — estraiamo i valori dentro
  const jsonArrayMatch = /^JSON_ARRAY\(([^)]*)\)/i.exec(s.slice(i));
  let tag = [];
  if (jsonArrayMatch) {
    // Parsa i valori stringa dell'array
    const inner = jsonArrayMatch[1];
    const tagRe = /'([^']*)'/g;
    let m;
    while ((m = tagRe.exec(inner)) !== null) tag.push(m[1]);
    i += jsonArrayMatch[0].length;
  }

  return { titolo, descrizione, durata_minuti, categoria, eta_leva, tag };
}

// ── Estrai obiettivo e svolgimento dalla descrizione ──────────────────────────
function estraiObiettivo(descrizione) {
  if (!descrizione) return 'Vedi descrizione completa nella libreria sessioni dell\'app MyVivaio.';
  // Prima frase significativa (max 120 caratteri)
  const firstSentence = descrizione.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 10) return firstSentence.slice(0, 120);
  return descrizione.slice(0, 120);
}

function estraiSvolgimento(descrizione) {
  if (!descrizione || descrizione.length < 20) {
    return '<li>Vedi descrizione completa nella libreria sessioni dell\'app MyVivaio.</li>';
  }

  // Spezza in frasi
  const sentences = descrizione
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  if (sentences.length === 0) {
    return `<li>${esc(descrizione.slice(0, 200))}</li>`;
  }

  // Prende 3-5 frasi significative
  const points = sentences.slice(0, 5);
  return points.map(s => `            <li>${esc(s)}</li>`).join('\n');
}

// ── HTML escape ────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Template HTML ──────────────────────────────────────────────────────────────
function buildHtml(session, numero, fileName) {
  const etaMeta  = ETA_META[session.eta_leva]  || { label: session.eta_leva };
  const catMeta  = CATEGORIA_META[session.categoria] || { label: session.categoria };
  const materiale = MATERIALE[session.categoria] || 'Palloni, cinesini';
  const nota     = NOTA_ETA[session.eta_leva]   || '';
  const svg      = SVG[session.categoria] || SVG['riscaldamento'];
  const numStr   = String(numero).padStart(3, '0');
  const obiettivo = estraiObiettivo(session.descrizione);
  const svolgimento = estraiSvolgimento(session.descrizione);

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(session.titolo)} · MyVivaio</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f5f4ee;
    padding: 20px;
    min-height: 100vh;
  }
  .quaderno {
    background: #fefdf8;
    border: 2px solid #2D3748;
    border-radius: 4px;
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
  }
  .header {
    border-bottom: 2px dashed #2D3748;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Courier New', monospace;
  }
  .header-id { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #1A7A4A; }
  .header-eta { font-size: 11px; color: #666; }
  .titolo { font-size: 24px; font-weight: 800; margin: 8px 0 4px; color: #2D3748; }
  .meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #555; margin-top: 6px; }
  .body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 700px) {
    .body-grid { grid-template-columns: 1fr; }
    body { padding: 8px; }
    .quaderno { padding: 16px; }
  }
  .schema-figura {
    background: #fefdf8;
    border: 1.5px solid #2D3748;
    aspect-ratio: 7 / 6;
    width: 100%;
  }
  .figura-caption {
    font-size: 10px; color: #666; margin-top: 4px;
    text-align: center; font-style: italic; font-family: 'Courier New', monospace;
  }
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 11px; font-weight: 800; color: #1A7A4A;
    letter-spacing: 1px; border-bottom: 1px solid #1A7A4A;
    padding-bottom: 2px; margin-bottom: 6px;
  }
  .section-content { font-size: 13px; color: #2D3748; line-height: 1.5; }
  .section-content ol { margin: 0; padding-left: 18px; }
  .section-content ol li { margin-bottom: 4px; }
  .nota-mister {
    background: #f0fdf4; padding: 10px;
    border-left: 3px solid #1A7A4A; border-radius: 2px; margin-top: 14px;
  }
  .nota-label { font-size: 10px; font-weight: 800; color: #1A7A4A; letter-spacing: 1px; }
  .nota-testo { font-size: 12px; color: #555; margin-top: 4px; }
  .footer {
    border-top: 1px dashed #2D3748; margin-top: 16px; padding-top: 8px;
    font-size: 10px; color: #999; text-align: center; font-family: 'Courier New', monospace;
  }
  @media print {
    body { background: white; padding: 0; }
    .quaderno { border: none; max-width: 100%; }
  }
</style>
</head>
<body>
<div class="quaderno">
  <div class="header">
    <div class="header-top">
      <div class="header-id">MYVIVAIO · SESSIONE N° ${numStr}</div>
      <div class="header-eta">${esc(etaMeta.label)}</div>
    </div>
    <h1 class="titolo">${esc(session.titolo)}</h1>
    <div class="meta">
      <span><strong>⏱</strong> ${session.durata_minuti} min</span>
      <span><strong>◆</strong> ${esc(catMeta.label)}</span>
      <span><strong>★</strong> Ufficiale MyVivaio</span>
    </div>
  </div>
  <div class="body-grid">
    <div>
      ${svg}
      <div class="figura-caption">Fig. 1 — Schema disposizione</div>
    </div>
    <div>
      <div class="section">
        <div class="section-title">OBIETTIVO</div>
        <div class="section-content">${esc(obiettivo)}</div>
      </div>
      <div class="section">
        <div class="section-title">SVOLGIMENTO</div>
        <div class="section-content">
          <ol>
${svolgimento}
          </ol>
        </div>
      </div>
      <div class="section">
        <div class="section-title">MATERIALE</div>
        <div class="section-content">${esc(materiale)}</div>
      </div>
      <div class="nota-mister">
        <div class="nota-label">NOTA MISTER</div>
        <div class="nota-testo">${esc(nota)}</div>
      </div>
    </div>
  </div>
  <div class="footer">myvivaio.app · ${esc(fileName)}</div>
</div>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Generator: 420 HTML Quaderno Tecnico — MyVivaio');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Cancella e ricrea la cartella output
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
    console.log('✓ Cartella precedente rimossa');
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Crea le 6 sottocartelle
  Object.values(ETA_META).forEach(({ folder }) => {
    fs.mkdirSync(path.join(OUT_DIR, folder), { recursive: true });
  });
  console.log('✓ Sottocartelle create\n');

  // 2. Leggi e parsa i 6 file SQL
  const SQL_FILES = [
    ['primi_calci',  '20260521_sessioni_ufficiali_primi_calci.sql'],
    ['pulcini',      '20260521_sessioni_ufficiali_pulcini.sql'],
    ['esordienti',   '20260521_sessioni_ufficiali_esordienti.sql'],
    ['giovanissimi', '20260521_sessioni_ufficiali_giovanissimi.sql'],
    ['allievi',      '20260521_sessioni_ufficiali_allievi.sql'],
    ['juniores',     '20260521_sessioni_ufficiali_juniores.sql'],
  ];

  const manifest = [];
  let totalGenerated = 0;
  const countPerEta = {};

  for (const [eta, sqlFile] of SQL_FILES) {
    const filePath = path.join(MIGRATIONS_DIR, sqlFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File non trovato: ${filePath}`);
      process.exit(1);
    }

    console.log(`Parsing: ${sqlFile}`);
    const sessions = parseSqlFile(filePath);
    console.log(`  → ${sessions.length} sessioni trovate per ${eta}`);

    if (sessions.length !== 70) {
      console.warn(`  ⚠ Attenzione: attese 70 sessioni, trovate ${sessions.length}`);
    }

    const folder = ETA_META[eta].folder;
    let counter = 0;

    for (const session of sessions) {
      counter++;
      const numStr = String(counter).padStart(3, '0');
      const slug = slugify(session.titolo);
      const fileName = `${numStr}-${slug}.html`;
      const fileDest = path.join(OUT_DIR, folder, fileName);
      const relativePath = `${folder}/${fileName}`;

      const html = buildHtml(session, counter, fileName);
      fs.writeFileSync(fileDest, html, 'utf8');

      totalGenerated++;

      // Genera un UUID deterministico (non UUID() SQL — usiamo un placeholder)
      // Lo script non ha DB, quindi usiamo un UUID v4 pseudo-random basato su titolo+eta
      const fakeId = pseudoUuid(session.titolo + session.eta_leva);

      manifest.push({
        sessione_id: fakeId,
        titolo: session.titolo,
        eta: session.eta_leva,
        categoria: session.categoria,
        durata_minuti: session.durata_minuti,
        file_path: relativePath,
        url_pubblico: `https://app.myvivaio.app/sessioni-ufficiali/${relativePath}`,
      });

      if (totalGenerated % 30 === 0 || counter === 1) {
        process.stdout.write(`  Generata ${String(totalGenerated).padStart(3,'0')}/420 — ${relativePath}\n`);
      }
    }

    countPerEta[eta] = counter;
    console.log(`  ✓ ${eta}: ${counter} file HTML\n`);
  }

  // 3. Scrivi manifest
  const manifestPath = path.join(OUT_DIR, '_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✓ Manifest scritto: ${manifestPath} (${manifest.length} entry)\n`);

  // 4. Verifica
  const allHtml = findHtmlFiles(OUT_DIR);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  VERIFICA FINALE`);
  console.log(`  File HTML totali: ${allHtml.length} (attesi 420)`);
  Object.entries(countPerEta).forEach(([eta, n]) => {
    console.log(`  ${eta.padEnd(15)} : ${n} file`);
  });
  if (allHtml.length !== 420) {
    console.error(`\n❌ ERRORE: generati ${allHtml.length} file, attesi 420!`);
    process.exit(1);
  }
  console.log('\n✅ Generazione completata con successo!');
  console.log('═══════════════════════════════════════════════════════');
}

// ── Utility ───────────────────────────────────────────────────────────────────
function findHtmlFiles(dir) {
  const results = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d)) {
      const full = path.join(d, entry);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.html')) results.push(full);
    }
  }
  walk(dir);
  return results;
}

function pseudoUuid(seed) {
  // UUID v4-like deterministico basato su hash stringa (solo interi 32-bit)
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c * 31), 0x811c9dc5) >>> 0;
  }
  const h3 = Math.imul(h1, h2 ^ 0xdeadbeef) >>> 0;
  const h4 = Math.imul(h2, h1 ^ 0xcafebabe) >>> 0;
  function hex(n, len) { return (n >>> 0).toString(16).padStart(len, '0').slice(-len); }
  return `${hex(h1, 8)}-${hex(h2, 4)}-4${hex(h3, 3)}-${['8','9','a','b'][h4 % 4]}${hex(h4, 3)}-${hex(h1^h3, 8)}${hex(h2^h4, 4)}`;
}

main();
