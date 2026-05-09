FROM node:20-slim

WORKDIR /app

ENV COREPACK_ENABLE_STRICT=0
ENV NODE_ENV=production
RUN npm install -g pnpm@10

# Copy workspace manifests first (better layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.base.json ./

# Copy all workspace packages needed for the build
COPY artifacts/fieldos/   ./artifacts/fieldos/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY lib/  ./lib/
COPY scripts/ ./scripts/

# Install all dependencies (including devDeps needed for build)
RUN pnpm install

# Build frontend (static files → artifacts/fieldos/dist/public/)
RUN BASE_PATH=/ pnpm --filter @workspace/fieldos run build

# Build API server (compiled bundle → artifacts/api-server/dist/)
RUN pnpm --filter @workspace/api-server run build

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
