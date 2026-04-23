bkp3 — Antes do Sprint 4 (deploy Coolify)
Data: 2026-04-23
Sprint: Sprint 4 - Deploy via Coolify no VPS DiWins

==================================================
O QUE VAI SER FEITO
==================================================
1. Copiar 9 JSONs do acervo pra ./acervo/ (dentro do projeto, commitado)
2. Ajustar seed.ts + knowledge.ts pra ler de ./acervo/ com fallback
3. Criar Dockerfile multi-stage (Node 22 alpine, Next standalone)
4. next.config.mjs: output: "standalone"
5. .dockerignore pra minimizar imagem
6. Gerar senhas finais (Lucas + Samara) + hash bcrypt escapado
7. Criar repo GitHub privado (gh CLI)
8. Push inicial
9. Via Coolify API: criar Postgres DB + App + env vars + domínio
10. Trigger deploy
11. Seed do Postgres remoto
12. Smoke test produção

Deploy target:
- VPS: 2.24.220.46 (DiWins, compartilhada)
- Domínio: se-social.2-24-220-46.sslip.io
- Postgres: novo container Coolify (ISOLADO do DB DiWins)

ARQUIVOS AFETADOS (backup):
- next.config.mjs
- prisma/seed.ts
- src/lib/knowledge.ts

NOVOS:
- Dockerfile, .dockerignore
- acervo/type_N.json (9 arquivos copiados)
- .env.production (template, não commitar)

==================================================
COMO REVERTER
==================================================
1. Parar app Coolify via API
2. Deletar Postgres Coolify via API
3. cp bkp3/* de volta aos paths originais
4. Deletar repo GitHub (manual via UI)
5. rm Dockerfile .dockerignore acervo/ .env.production
