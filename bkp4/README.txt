bkp4 — Antes do Sprint 5 (Playbook Samara)
Data: 2026-04-23
Sprint: 5 - página /playbook em PT-BR pra Samara estudar Enneagram

==================================================
O QUE VAI SER FEITO
==================================================
1. Nova rota /playbook — página estática em PT-BR com 16 seções
2. Accordeão por seção (default aberto)
3. TOC lateral sticky
4. Checkbox "Concluído" por seção (localStorage do browser dela)
5. Link "Playbook" no header

ARQUIVOS MODIFICADOS:
- src/app/layout.tsx          (adiciona link Playbook no nav)

ARQUIVOS NOVOS:
- src/app/playbook/page.tsx
- src/app/playbook/PlaybookContent.tsx

==================================================
COMO REVERTER
==================================================
1. cp bkp4/layout.tsx src/app/layout.tsx
2. rm -rf src/app/playbook
3. npm run build (se estava rodando prod local) ou deploy Coolify
