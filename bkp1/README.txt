bkp1 — Antes do Sprint 2 (UX updates)
Data: 2026-04-22
Sprint: Sprint 2 - UX improvements no editor e form

==================================================
O QUE VAI SER FEITO NESTE SPRINT
==================================================
1. Remover "a partir do acervo de 5.513 citações" da home
2. Inverter colunas no editor: PT à esquerda, EN à direita
3. Adicionar botão "Atualizar" em cada campo EN que traduz o PT editado → EN
4. Adicionar tooltips (?) em cada campo do form /new com didática PT

Nova API:
- /api/translate POST {text, field, context} → {translated} — traduz PT→EN mantendo voz

==================================================
ARQUIVOS AFETADOS (modificados)
==================================================
- src/app/page.tsx                              (texto home)
- src/app/new/NewPostForm.tsx                   (tooltips)
- src/app/posts/[id]/PostEditor.tsx             (inverter cols + botão atualizar)
- src/app/api/translate/route.ts                (NOVO)

==================================================
COMO REVERTER
==================================================
1. Parar o dev server
2. Copiar os arquivos deste bkp1/ de volta:
   cp bkp1/src/app/page.tsx src/app/page.tsx
   cp bkp1/src/app/new/NewPostForm.tsx src/app/new/NewPostForm.tsx
   cp "bkp1/src/app/posts/[id]/PostEditor.tsx" "src/app/posts/[id]/PostEditor.tsx"
3. Deletar a nova API:
   rm -rf src/app/api/translate
4. Rebuild:
   npm run build && npm start

Nenhum arquivo fora da pasta smartenneagram/src/app/ foi tocado.
O acervo, a knowledge base e o DB permanecem intactos.
