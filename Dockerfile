# 2026-05-18-v16 — fix superadmin routes
FROM node:20-slim

WORKDIR /app

# Railway injects RAILWAY_GIT_COMMIT_SHA as build arg — unique per commit, busts COPY cache
ARG RAILWAY_GIT_COMMIT_SHA=unknown
RUN echo "deploy commit: $RAILWAY_GIT_COMMIT_SHA"

COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
