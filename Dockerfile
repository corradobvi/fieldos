# 2026-05-18-v14 — workdir /srv to bypass any /app volume
FROM node:20-alpine

WORKDIR /srv

COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "/srv/artifacts/api-server/dist/index.mjs"]
