# 2026-05-18-v10 — superadmin routes canary + version marker
FROM node:20-slim

WORKDIR /app

# ARG must be referenced in a RUN to actually bust subsequent COPY layers
ARG CACHEBUST=2026-05-18-v10
RUN echo "cache bust: $CACHEBUST"

# The dist is a self-contained esbuild bundle — no npm install needed at runtime
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
