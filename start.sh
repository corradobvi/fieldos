#!/usr/bin/env bash
set -e

PNPM="$HOME/.npm-global/node_modules/.bin/pnpm"
export PATH="$HOME/.npm-global/node_modules/.bin:$PATH"

echo "Avvio FieldOS..."

# api-server
PORT=3001 $PNPM --filter @workspace/api-server run dev &
API_PID=$!

# frontend fieldos
PORT=5173 BASE_PATH="/" $PNPM --filter @workspace/fieldos run dev &
FRONT_PID=$!

echo ""
echo "  Frontend:  http://localhost:5173"
echo "  API server: http://localhost:3001"
echo ""
echo "  Premi Ctrl+C per fermare tutto."

trap "kill $API_PID $FRONT_PID 2>/dev/null; exit 0" INT TERM
wait
