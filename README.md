# SmartEnneagram · Social Factory

App interno para geração de posts de Instagram + LinkedIn do SmartEnneagram, consumindo o acervo real de 5.513 citações.

- **Output**: caption EN (pronta pra colar) + tradução PT + prompts de imagem + diagramação JSON
- **IA**: Claude / GPT / Híbrido (configurável)
- **Imagens**: só prompts — Samara gera no Nano Banana ou manda pro designer
- **Stack**: Next.js 14 + Prisma + SQLite (dev) + Tailwind + shadcn/ui

---

## Setup inicial (uma vez só)

```bash
cd "C:/Users/lucas 1/Desktop/LUCAS/lps/social_media/smartenneagram"
npm install
npm run setup   # = prisma db push + seed do acervo
```

O seed lê os 9 `type_N.json` de:
```
C:/Users/lucas 1/Desktop/LUCAS/lps/acervo enneagram/output
```
(path configurável via `ACERVO_PATH` no `.env`)

---

## Rodar em dev

```bash
npm run dev
```

Abre em **http://localhost:3030**.

Primeira coisa: vai em `/admin/config` e cola as chaves Anthropic + OpenAI. Depois é criar post.

---

## Fluxo de uso (Samara)

1. **`/new`** → preenche brief (rede, pilar, modelo, type, ângulo, gatilho, locale, profundidade)
2. Clica **Gerar post** → IA consome acervo e retorna post estruturado
3. **`/posts/[id]`** → vê EN + PT lado a lado, edita bloco por bloco, vê compliance
4. **Download ZIP** → pasta com:
   - `en_caption.txt` — caption completa pra colar no IG/LinkedIn
   - `pt_caption.txt` — referência pra Samara entender
   - `image_prompts.txt` — prompts em EN pra Nano Banana / designer
   - `layout.json` — diagramação (onde vai cada camada)
   - `alt_text.txt`, `hashtags.txt`
   - `INSTRUCOES_SAMARA.md` — passo-a-passo em português
   - `_full_output.json` — backup completo
5. **Status workflow**: `draft → ready → approved → scheduled → published`

---

## Estrutura do projeto

```
smartenneagram/
├── prisma/
│   ├── schema.prisma       # Citation, TypeMeta, Post, Config
│   └── seed.ts             # importa os 9 type_N.json
├── src/
│   ├── app/
│   │   ├── page.tsx        # home — lista de posts
│   │   ├── new/            # brief + geração
│   │   ├── posts/[id]/     # editor bloco-a-bloco
│   │   ├── admin/config/   # chaves IA
│   │   └── api/            # generate, citations, config, posts, export
│   ├── components/ui/      # button, card, input, etc
│   └── lib/
│       ├── db.ts           # prisma client + getConfig/setConfig
│       ├── ai.ts           # wrapper Claude/GPT/Hybrid
│       ├── acervo.ts       # pickCitations com anti-repetição
│       ├── models.ts       # M1-M9 definições
│       └── prompts.ts      # system prompt + user brief builder
└── bkp0/README.txt         # estado inicial (sprint 1)
```

---

## Pilares editoriais (briefing)

| # | Pilar | IG | LI |
|---|---|---|---|
| A | Signs & Identification | 30% | 10% |
| B | Citation of the Day (DNA do perfil) | 15% | 25% |
| C | Type in Context (work/relationships/stress) | 20% | 20% |
| D | Myth-busting / Comparison | 15% | 15% |
| E | Interactive / Quiz | 15% | 5% |
| F | Behind the Science (psicometria, Big5) | 5% | 25% |

---

## Modelos visuais (M1-M9)

- **M1** Photo + Brand + Headline
- **M2** Torn Paper / News Style
- **M3** Carousel Deep-Dive (8-10 slides)
- **M4** Interactive / Quiz
- **M5** Citation Card (DNA — tipografia pura)
- **M6** Split-Screen Comparison
- **M7** Celebrity Type Deconstruction (hedging obrigatório)
- **M8** Reel / Short Video (roteiro + cover)
- **M9** Data Viz / Infographic (forte no LinkedIn)

---

## Deploy na VPS (quando for a hora)

1. Trocar `datasource db` em `prisma/schema.prisma` de `sqlite` pra `postgresql`
2. Configurar `DATABASE_URL` com connection string Postgres da VPS
3. Build: `npm run build` → `npm start -p 3030`
4. PM2 + Nginx + SSL no domínio (ex: `app.smartenneagram.com`)

Nenhum código de app muda — só o datasource do Prisma.

---

## Troubleshooting

| Problema | Fix |
|---|---|
| `Anthropic API key not set` | Ir em `/admin/config` e colar a chave |
| `Nenhuma citação encontrada` | Tipo/categoria muito restritos — abrir os filtros |
| Seed falha | Verificar `ACERVO_PATH` no `.env` |
| Build erro em `prisma/dev.db` | Rodar `npm run db:push` antes de build |
