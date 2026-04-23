bkp2 — Antes do Sprint 3 (deploy VPS + auth)
Data: 2026-04-23
Sprint: Sprint 3 - Deploy online com login

==================================================
O QUE VAI SER FEITO NESTE SPRINT
==================================================
1. Adicionar bcryptjs e jose ao package.json
2. Trocar datasource Prisma: sqlite → postgresql (mantém fallback por env DB_PROVIDER)
3. Sistema de auth simples:
   - Users em .env (LUCAS + SAMARA) com senha bcrypt
   - /login page + /api/auth/login + /api/auth/logout
   - Cookie JWT HttpOnly
   - middleware.ts protege tudo exceto /login
4. Botão Sair no header
5. Scripts de deploy pra VPS: PM2 ecosystem, nginx.conf.example, setup.sh, DEPLOY.md
6. Script de migração sqlite → postgres (uma vez)

==================================================
ARQUIVOS AFETADOS (modificados ou criados)
==================================================
Modificados:
- package.json                              (deps auth)
- prisma/schema.prisma                      (datasource postgres)
- src/app/layout.tsx                        (header com logout)
- .env                                      (DB_PROVIDER, users, JWT_SECRET)
- .env.example                              (mesmo)

Novos:
- src/lib/auth.ts
- src/middleware.ts
- src/app/login/page.tsx
- src/app/api/auth/login/route.ts
- src/app/api/auth/logout/route.ts
- src/app/api/auth/me/route.ts
- scripts/migrate_sqlite_to_postgres.ts
- scripts/hash_password.ts
- ecosystem.config.js
- deploy/nginx.conf.example
- deploy/setup.sh
- DEPLOY.md

==================================================
COMO REVERTER
==================================================
1. Para o PM2 na VPS (se já subiu): pm2 delete smartenneagram-social
2. Copiar arquivos do bkp2 de volta:
   cp bkp2/package.json package.json
   cp bkp2/prisma/schema.prisma prisma/schema.prisma
   cp bkp2/layout.tsx src/app/layout.tsx
   cp bkp2/.env .env
3. Deletar novos arquivos:
   rm -rf src/lib/auth.ts src/middleware.ts src/app/login src/app/api/auth
   rm -f ecosystem.config.js DEPLOY.md
   rm -rf deploy/
   rm -f scripts/migrate_sqlite_to_postgres.ts scripts/hash_password.ts
4. npm install (reverte package.json)
5. npm run build && npm start

O DB SQLite local (prisma/dev.db) permanece intacto durante todo o sprint.
