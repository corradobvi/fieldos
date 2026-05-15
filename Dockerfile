# 2026-05-15-v8 — pre-built dist bundle (esbuild, no pnpm build step)
FROM node:20-slim

WORKDIR /app

# The dist is a self-contained esbuild bundle — no npm install needed at runtime
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
