#!/usr/bin/env bash
# =====================================================
# deploy.sh — atualiza o app na VPS (roda toda vez que fizer pull)
# =====================================================
set -e

echo "==> 1. Pull da main..."
git pull

echo "==> 2. Trocando pra schema Postgres..."
cp prisma/schema.postgres.prisma prisma/schema.prisma

echo "==> 3. npm install..."
npm install --production=false --no-audit --no-fund

echo "==> 4. Prisma generate + db push..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "==> 5. Build..."
npm run build

echo "==> 6. Restart PM2..."
pm2 restart smartenneagram-social || pm2 start ecosystem.config.js

echo ""
echo "✓ Deploy concluído."
pm2 status
