#!/bin/sh
# Entrypoint do container — roda a cada restart (POSIX sh, compatível com alpine/busybox)
# Aplica schema Prisma (idempotente) e seed condicional

set -e

echo "[entrypoint] aguardando DB ..."
sleep 2

echo "[entrypoint] aplicando schema Prisma (db push) ..."
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss || {
  echo "[entrypoint] prisma db push falhou — encerrando"
  exit 1
}

# Seed condicional: só se SEED_ON_START=1
# (seed.ts usa deleteMany+createMany, então é idempotente — mas custa tempo)
if [ "$SEED_ON_START" = "1" ]; then
  echo "[entrypoint] SEED_ON_START=1 → rodando seed do acervo ..."
  ./node_modules/.bin/tsx prisma/seed.ts || {
    echo "[entrypoint] seed falhou — continuando mesmo assim"
  }
else
  echo "[entrypoint] SEED_ON_START != 1, pulando seed"
fi

echo "[entrypoint] subindo Next.js ..."
exec "$@"
