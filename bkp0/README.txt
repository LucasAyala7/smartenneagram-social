bkp0 — Estado inicial (projeto zerado)
Data: 2026-04-22
Sprint: Sprint 1 - MVP Social Factory (localhost)

==================================================
O QUE FOI FEITO NESTE SPRINT
==================================================
Criação do zero do app SmartEnneagram Social Factory.

Stack decidido:
- Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- Prisma + SQLite (dev local) | Postgres quando subir pra VPS
- Anthropic SDK (Claude 4.7) + OpenAI SDK (GPT-4o) — hibrido configuravel
- Sem auth no MVP localhost (so Lucas local)
- Sem geracao de imagens — so prompts + diagramacao JSON

Ingestao: 9 arquivos type_N.json de
  C:\Users\lucas 1\Desktop\LUCAS\lps\acervo enneagram\output\
sao importados via prisma/seed.ts na 1a execucao.

==================================================
COMO REVERTER
==================================================
Este eh o estado INICIAL. Para reverter:
1. Apagar a pasta C:\Users\lucas 1\Desktop\LUCAS\lps\social_media\smartenneagram\
   (o acervo em lps\acervo enneagram\ NAO eh tocado).
2. O seed apenas LE os JSONs do acervo, nao modifica nada la.

Nenhum arquivo fora da pasta smartenneagram/ foi alterado por este sprint.

==================================================
ARQUIVOS AFETADOS (criados)
==================================================
Todos os arquivos abaixo de:
  C:\Users\lucas 1\Desktop\LUCAS\lps\social_media\smartenneagram\
