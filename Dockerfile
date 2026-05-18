# 2026-05-18-v11 — alpine + nocache
FROM node:20-alpine

# This RUN always produces a different layer hash — kills any cache
RUN echo "built at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > /build-timestamp

WORKDIR /app

COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
