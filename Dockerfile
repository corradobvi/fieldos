FROM node:20-slim

WORKDIR /app

# Copia solo il bundle pre-compilato — nessun build step su Railway
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
