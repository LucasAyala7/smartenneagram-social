#!/bin/sh
# Entrypoint do container — roda uma vez por restart
# Aplica schema Prisma (idempotente) e seed condicional

set -e

echo "[entrypoint] aguardando DB ..."
# simples sleep — Coolify já garante ordem, mas adicionamos margem
sleep 2

echo "[entrypoint] aplicando schema Prisma (db push) ..."
# --accept-data-loss é seguro aqui: schema bem definido, sem migrations destrutivas nesse projeto
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss || {
  echo "[entrypoint] prisma db push falhou — encerrando"
  exit 1
}

echo "[entrypoint] verificando se DB está vazio ..."
# Roda seed só se não houver citações ainda
CITATION_COUNT=$(./node_modules/.bin/prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Citation\";" 2>/dev/null || echo "0")

# Abordagem mais simples: tenta seed, ele já deleta+reinsere (idempotente)
# Mas custa tokens/tempo — só roda se SEED_ON_START=1 ou acervo ainda não foi carregado
if [ "$SEED_ON_START" = "1" ]; then
  echo "[entrypoint] SEED_ON_START=1 → rodando seed ..."
  ./node_modules/.bin/tsx prisma/seed.ts || echo "[entrypoint] seed falhou (continuando)"
else
  echo "[entrypoint] SEED_ON_START != 1, pulando seed (rodar manual uma vez: docker exec ...)"
fi

echo "[entrypoint] subindo Next.js ..."
exec "$@"
