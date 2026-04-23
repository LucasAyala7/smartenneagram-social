# SmartEnneagram Social Factory — Dockerfile multi-stage pra Coolify
# Base: Node 22 alpine | Output: Next standalone (imagem pequena)

# =====================================================
# 1. deps — instala dependências
# =====================================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Usa schema postgres (prod) pro generate
RUN cp prisma/schema.postgres.prisma prisma/schema.prisma

RUN npm ci --no-audit --no-fund

# =====================================================
# 2. builder — gera prisma client + compila Next
# =====================================================
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Garante que estamos usando o schema postgres
RUN cp prisma/schema.postgres.prisma prisma/schema.prisma

# Gera prisma client antes do build
RUN npx prisma generate

# Build Next (standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =====================================================
# 3. runner — imagem final minimalista
# =====================================================
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma precisa do schema + client gerado + engine
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Knowledge base + acervo (lidos em runtime)
COPY --from=builder --chown=nextjs:nodejs /app/knowledge ./knowledge
COPY --from=builder --chown=nextjs:nodejs /app/acervo ./acervo

# Scripts (pro entrypoint rodar seed/migrations se precisar)
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx

# Entrypoint aplica schema + seed na 1ª subida (idempotente)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3030
ENV PORT=3030
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://127.0.0.1:3030/login || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
