# Istruzioni permanenti per Claude

## DEPLOY OBBLIGATORIO DOPO OGNI MODIFICA

**IMPORTANTE:** dopo OGNI modifica al codice, eseguire SEMPRE:

```bash
cp artifacts/fieldos/index.html artifacts/fieldos/dist/public/index.html
git add -A
git commit -m "update: [descrizione breve]"
git push origin main
```

**Non terminare MAI una sessione di lavoro senza aver fatto il push su GitHub.**

- **Railway** fa il deploy automatico del backend API dopo ogni push su `main`
- **Netlify** fa il deploy automatico del frontend dopo ogni push su `main`

## Architettura deploy

- Frontend (SPA): `artifacts/fieldos/index.html` è la sorgente
- Frontend (deployed): `artifacts/fieldos/dist/public/index.html` deve essere sempre identico alla sorgente
- **CRITICO**: ogni modifica a `index.html` deve essere copiata in `dist/public/index.html` prima del commit, altrimenti Netlify serve la versione vecchia
- Backend API: `artifacts/api-server/` → Railway (Dockerfile)
- Proxy API: Netlify redirige `/api/*` → `https://workspacefieldos-production.up.railway.app/api/:splat`

## Script deploy rapido

```bash
./deploy.sh
```

Oppure manualmente:

```bash
cp artifacts/fieldos/index.html artifacts/fieldos/dist/public/index.html
git add -A && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" && git push origin main
```
