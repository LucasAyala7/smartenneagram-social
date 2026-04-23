# Knowledge Base — SmartEnneagram Social Factory

Esta pasta é consumida pelo `lib/knowledge.ts` e injetada no system prompt da IA.

## Estrutura

```
knowledge/
├── INDEX.md                     (este arquivo)
├── core/                        (sempre injetado)
│   ├── voice_guide.md           voz, tom, do's/don'ts
│   ├── hedging_language.md      celebridades, mental health, absolutos
│   ├── caption_structure.md     anatomia da legenda (6 blocos)
│   ├── image_prompt_blueprint.md prompts ultra-realistas (câmera, lente, etc)
│   ├── compliance_rules.md      checklist legal, disclaimers
│   ├── glossary.md              termos técnicos EN (wing, instinct, fixation...)
│   ├── locale_variants.md       US / UK / CA / AU / neutral
│   └── hashtag_bank.md          banco por tipo / pilar / rede
├── types/                       (injetado o do `typeTarget`)
│   └── type_1.md ... type_9.md  cheatsheet profundo por tipo
├── models/                      (injetado o do `model`)
│   └── M1.md ... M9.md          quando usar, estrutura, layout JSON, mistakes
└── pillars/                     (injetado o do `pillar`)
    └── A.md ... F.md            propósito, tom, formatos, mix calendário
```

## Orçamento de tokens por geração

| Categoria | Tokens estimados |
|---|---|
| core/ (7 arquivos, sempre) | ~6.000 |
| types/type_N (1 por request) | ~800 |
| models/Mx (1 por request) | ~700 |
| pillars/Y (1 por request) | ~400 |
| **Total no system prompt** | **~8.000** |

Pra Claude 4.7 (200K ctx) e GPT-4o (128K ctx), sobra MUITO espaço.

## Como atualizar

1. Edita o MD relevante
2. Reinicia o dev server (ou aguarda o cache expirar — TTL 5min)
3. A próxima geração de post já usa a nova knowledge

## Filosofia

- **Knowledge = voz persistente.** Não varia por post.
- **Acervo (DB) = dados factuais.** Varia por post (citação escolhida).
- **Brief = parâmetros do post.** Varia por post (type, pillar, etc).

O system prompt empilha: brief + knowledge filtrado + candidatas de citação. A IA recebe tudo que precisa pra performar no nível de um copywriter sênior que conhece Eneagrama há 10 anos.
