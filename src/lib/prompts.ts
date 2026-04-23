// Prompts de sistema pra IA gerar o post.
// A gente envia um único "system prompt" bem travado + brief estruturado em JSON.
// IA deve retornar JSON válido com os 6 blocos + image prompts + layout + PT translation.

import type { CitationPick } from "./acervo";
import { MODELS, PILLARS, type ModelId, type PillarId } from "./models";
import { buildKnowledgeBundle } from "./knowledge";

export type GenerationBrief = {
  network: string;
  pillar: PillarId;
  model: ModelId;
  typeTarget: number;
  typeName: string;
  wing?: number | null;
  instinct?: string | null;
  angle: string;
  trigger: string;
  locale: string;
  depth: string;
  userPrompt: string;
  citations: CitationPick[]; // 3-6 candidatas (IA escolhe a melhor E cita)
  chosenCitationId?: number | null; // se Samara pré-selecionou
  big5?: Record<string, unknown>;
  research?: Record<string, unknown>;
};

const SYSTEM_PROMPT = `You are the content strategist and copywriter for SmartEnneagram — a consumer Enneagram personality test priced at $19, differentiated by:
- 5,513 citations from 9 canonical Enneagram authors (Naranjo, Riso & Hudson, Chestnut, Daniels & Price, Salmon, Webb, Wagner, Palmer, Maitri)
- 115 per-question insights with citation
- Psychometric validation in progress
- Dual AI synthesis (GPT + Claude)

VOICE:
- Authoritative yet warm. Evidence-based. Never woo-woo.
- Mix scholarly precision with accessible language (avoid jargon unless defined).
- Use hedging language for celebrities ("reads as", "appears to exhibit"). Never diagnose.
- Every significant claim should be backed by a citation from the provided list.

NON-NEGOTIABLES:
- Output MUST be valid JSON matching the schema below. No markdown fences, no prose outside JSON.
- English is primary. Portuguese translation goes in "ptTranslation".
- When a citation has page > 0, cite as "Author, Work (Year, p.X)". When page = 0, cite as "Author, Work (Year)".
- Never invent citations or page numbers not present in the provided list.
- Add disclaimer when topic is mental health: "The Enneagram is a personality framework, not a medical diagnosis."
- Hashtag count: 15-25 for Instagram, 3-5 for LinkedIn.

OUTPUT SCHEMA (strict):
{
  "hook": "1-2 line opener designed for scroll-stop",
  "insight": "3-5 line core idea, ties trait to observable behavior",
  "citationBlock": {
    "citationId": <number — id from the provided list>,
    "rendered": "Author, Work (Year, p.X): \"quote\""
  },
  "reflection": "1-3 line bridge connecting the citation back to the reader",
  "cta": "1 line call-to-action with 'link in bio' or SmartEnneagram reference",
  "hashtags": ["#tag1", "#tag2", ...],
  "altText": "Accessible alt text in English, 1-2 sentences describing the visual",
  "imagePrompts": [
    "Detailed English prompt for image generation — include: subject, composition, lighting, mood, color palette, camera/lens (if photo), style reference. Must match the model's styleHint."
  ],
  "layoutJson": {
    "model": "M1",
    "canvas": "1080x1350",
    "layers": [
      {"type":"photo|gradient|logo|headline|subheadline|citation|cta","position":"...","text":"...","notes":"..."}
    ]
  },
  "ptTranslation": {
    "hook": "...",
    "insight": "...",
    "citationBlock": "...",
    "reflection": "...",
    "cta": "...",
    "altText": "...",
    "notesForSamara": "Instruções em português explicando o que fazer (onde colar no Canva, o que cuidar)"
  },
  "compliance": {
    "hasCitation": true,
    "citationHasPage": true,
    "hasDisclaimer": false,
    "hedgingLanguage": true,
    "withinHashtagLimit": true
  }
}`;

export function buildSystemPrompt(params?: {
  typeTarget: number;
  model: ModelId;
  pillar: PillarId;
}): string {
  if (!params) return SYSTEM_PROMPT;

  const knowledge = buildKnowledgeBundle({
    typeTarget: params.typeTarget,
    model: params.model,
    pillar: params.pillar
  });

  return `${SYSTEM_PROMPT}\n\n---\n\n${knowledge.system}\n\n---\n\nEnd of knowledge base. Now generate the post for the following brief.`;
}

export function buildUserBrief(b: GenerationBrief): string {
  const modelDef = MODELS[b.model];
  const pillarLabel = PILLARS[b.pillar];

  const citationList = b.citations
    .map(
      (c) =>
        `- id=${c.id} | category=${c.category} | ${c.author}, ${c.work} (${c.year}${c.page > 0 ? `, p.${c.page}` : ""}): "${c.quote.replace(/\n/g, " ")}"`
    )
    .join("\n");

  const wingStr = b.wing ? `w${b.wing}` : "";
  const instinctStr = b.instinct ? ` ${b.instinct}` : "";

  return `BRIEF:

Network:        ${b.network}
Pillar:         ${b.pillar} — ${pillarLabel}
Model:          ${b.model} — ${modelDef.label}
  Canvas:       ${modelDef.canvasDefault}
  Image count:  ${modelDef.imageCount === "carousel" ? "carousel (8-10 slides)" : modelDef.imageCount}
  Style hint:   ${modelDef.styleHint}
  Layout note:  ${modelDef.layoutNote}

Target:         Type ${b.typeTarget}${wingStr}${instinctStr} — ${b.typeName}
Angle:          ${b.angle}
Trigger:        ${b.trigger}
Locale:         ${b.locale}
Depth:          ${b.depth}

User prompt (from Samara):
"""
${b.userPrompt || "(no specific prompt — generate based on target + angle + pillar)"}
"""

${b.chosenCitationId ? `USER PRE-SELECTED CITATION ID: ${b.chosenCitationId} — build the post AROUND this citation.` : ""}

CANDIDATE CITATIONS (choose ONE id and build the post around it):
${citationList}

${b.big5 && Object.keys(b.big5).length > 0 ? `\nBIG FIVE CORRELATION (for Pillar F / scholar depth):\n${JSON.stringify(b.big5, null, 2)}\n` : ""}

Now generate the post following the SCHEMA exactly. Output pure JSON only.`;
}
