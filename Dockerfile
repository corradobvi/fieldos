# 2026-05-13 — rebuild: self-register path fix + phone column
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace manifests and lockfile for dependency installation
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install dependencies (production + build tools needed for esbuild)
RUN pnpm install --frozen-lockfile

# Copy source files needed for the build
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Build the API server bundle
RUN pnpm --filter @workspace/api-server run build

# Copy pre-built frontend
COPY artifacts/fieldos/dist/public/ ./artifacts/fieldos/dist/public/

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
