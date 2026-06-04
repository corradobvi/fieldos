# Istruzioni permanenti per Claude

## REGOLA ASSOLUTA — PUSH AUTOMATICO DOPO OGNI MODIFICA

**Dopo OGNI modifica al codice, anche la più piccola, eseguire sempre e automaticamente:**

```bash
cp artifacts/fieldos/index.html artifacts/fieldos/dist/public/index.html
git add -A && git commit -m "fix: [descrizione breve]" && git push origin main
```

- Non terminare MAI una risposta senza aver fatto il push su GitHub.
- Non aspettare conferma dall'utente per fare il push.
- Il push è parte integrante di ogni modifica — non un passo separato.
- Railway fa il deploy automatico dopo ogni push — le modifiche sono live per TUTTI gli utenti entro 2-3 minuti.

Se il push fallisce per credenziali:
```bash
git remote set-url origin https://corradobvi:[TOKEN]@github.com/corradobvi/fieldos.git
```

- **Railway** fa il deploy automatico (backend API + frontend statico) dopo ogni push su `main`.
  Il backend Express serve la SPA da `artifacts/api-server/dist/public/` (mirror di `artifacts/fieldos/dist/public/`).

## Architettura deploy

- Frontend (SPA): `artifacts/fieldos/index.html` è la sorgente
- Frontend (deployed): `artifacts/fieldos/dist/public/index.html` deve essere sempre identico alla sorgente
- **CRITICO**: ogni modifica a `index.html` deve essere copiata in `dist/public/index.html` (e quando serve `public/index.html`) prima del commit, altrimenti Railway serve la versione vecchia
- Backend API + FE statico: `artifacts/api-server/` → Railway (Dockerfile). Express serve la SPA via static middleware, `/api/*` punta agli handlers v2.
- Verifica bundle attivo in produzione: `GET /api/v2/_bundle-info` ritorna `{bundle, commitSha, deploymentId, uptimeSec}`. Se l'endpoint torna HTML invece di JSON → Railway sta servendo un bundle pre-`2d9ac03` e va forzato un redeploy dal dashboard.

## REGOLA CRITICA: verifica sintassi JS prima del push

**Dopo ogni modifica al codice JavaScript, verificare SEMPRE la sintassi prima di fare il push.**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('artifacts/fieldos/index.html', 'utf8');
const start = html.indexOf('<script>');
const end = html.indexOf('</script>', start);
const script = html.slice(start+8, end);
fs.writeFileSync('/tmp/_check.js', script);
" && node --check /tmp/_check.js && echo 'SYNTAX OK'
```

Errori da controllare in particolare:
- **`else if` dopo `else` finale** — causa `SyntaxError: Unexpected token 'else'` che blocca tutta l'app
- Template literals annidati non chiusi correttamente
- Parentesi o graffe non bilanciate

**Non fare mai il push se il controllo sintassi fallisce.** Un errore JS blocca il login su tutti i dispositivi.

## Script deploy rapido

```bash
./deploy.sh
```

Oppure manualmente:

```bash
cp artifacts/fieldos/index.html artifacts/fieldos/dist/public/index.html
git add -A && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" && git push origin main
```
