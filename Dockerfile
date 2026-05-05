FROM node:20-slim

WORKDIR /app

# Install pnpm directly via npm, bypassing corepack entirely
ENV COREPACK_ENABLE_STRICT=0
RUN npm install -g pnpm@10

# Copy workspace manifests first (better layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.base.json ./

# Copy all workspace packages needed for the build
COPY artifacts/fieldos/ ./artifacts/fieldos/
COPY lib/ ./lib/
COPY scripts/ ./scripts/

# Install dependencies
RUN pnpm install

# Build FieldOS (BASE_PATH=/ for root domain deploy)
RUN BASE_PATH=/ pnpm --filter @workspace/fieldos run build

EXPOSE 3000

CMD ["pnpm", "--filter", "@workspace/fieldos", "run", "serve"]
