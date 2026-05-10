FROM node:20-slim

WORKDIR /app

# Bundle API server (pre-compilato) e frontend fieldos (pre-buildato)
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
