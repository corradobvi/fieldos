#!/bin/bash
set -e

cd "$(dirname "$0")"

git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" || { echo "Nessuna modifica da pubblicare."; exit 0; }
git push origin main

echo "✅ Modifiche pubblicate su GitHub."
