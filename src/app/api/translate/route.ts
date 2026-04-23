import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getConfig } from "@/lib/db";
import { buildKnowledgeBundle } from "@/lib/knowledge";

// POST /api/translate
// body: { text, field, context: { type, pillar, model, angle } }
// retorna: { translated }
// Traduz PT -> EN preservando voz, evitando hedging errors, usando knowledge base.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, field, context } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text é obrigatório" }, { status: 400 });
    }
    if (!field) {
      return NextResponse.json({ error: "field é obrigatório" }, { status: 400 });
    }

    // Knowledge bundle leve pro contexto (type + model + pillar)
    let knowledge = "";
    if (context?.type && context?.model && context?.pillar) {
      const bundle = buildKnowledgeBundle({
        typeTarget: Number(context.type),
        model: context.model,
        pillar: context.pillar
      });
      knowledge = bundle.system;
    }

    const fieldGuide = fieldGuidance(field);

    const systemPrompt = `You are the English copywriter for SmartEnneagram social media. You receive a Portuguese version of a single caption block and produce the English version that will be posted.

RULES:
- Return ONLY the English translation — no markdown, no quotes, no prefix/suffix explanation.
- Preserve meaning, length proportion, and emotional register.
- Apply the SmartEnneagram voice: authoritative yet warm, evidence-based, never woo-woo.
- Use hedging language when the PT text implies any claim about a celebrity or diagnosis.
- Field type: ${field}. ${fieldGuide}
- Output naturally in English — do NOT translate literally. Re-craft for an English reader.
- Do NOT add hashtags unless the field is "hashtags".
- Do NOT invent citations or page numbers not present in the PT text.
- Keep line breaks / formatting consistent with the Portuguese version.

${knowledge ? `CONTEXT (apply tone/hedging/compliance from this knowledge):\n\n${knowledge}\n\n` : ""}`;

    const userPrompt = `Portuguese text for the ${field} block:

"""
${text}
"""

Write the English version now. Output only the English text.`;

    // Escolhe provider: GPT é mais rápido e punchy pra tradução
    const provider = await getConfig("ai_provider_default", "hybrid");
    const openaiKey = await getConfig("openai_api_key", process.env.OPENAI_API_KEY || "");
    const anthropicKey = await getConfig("anthropic_api_key", process.env.ANTHROPIC_API_KEY || "");

    let translated = "";

    // Prefere GPT pra tradução (mais rápido). Fallback pra Claude.
    if (provider === "claude" || (!openaiKey && anthropicKey)) {
      if (!anthropicKey) throw new Error("Anthropic API key not set. Configure em /admin/config.");
      const client = new Anthropic({ apiKey: anthropicKey });
      const model = await getConfig("ai_model_claude", "claude-opus-4-7");
      const res = await client.messages.create({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });
      translated = res.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n")
        .trim();
    } else {
      if (!openaiKey) throw new Error("OpenAI API key not set. Configure em /admin/config.");
      const client = new OpenAI({ apiKey: openaiKey });
      const model = await getConfig("ai_model_gpt", "gpt-4o");
      const res = await client.chat.completions.create({
        model,
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });
      translated = (res.choices[0]?.message?.content || "").trim();
    }

    // Remove aspas se a IA embrulhar o output
    translated = translated
      .replace(/^["']/, "")
      .replace(/["']$/, "")
      .replace(/^```(?:text|en)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    return NextResponse.json({ translated });
  } catch (err: any) {
    console.error("[translate]", err);
    return NextResponse.json({ error: err?.message || "Erro" }, { status: 500 });
  }
}

function fieldGuidance(field: string): string {
  switch (field) {
    case "hook":
      return "Should be 1-2 lines. Scroll-stopper. Punchy. Under 60 chars on line 1 if possible.";
    case "insight":
      return "3-5 lines. Connects observable behavior to the Enneagram concept. Cite no citation here (the citation block handles it).";
    case "reflection":
      return "1-3 lines. Bridges the insight back to the reader. Not a generic 'can you relate?'.";
    case "cta":
      return "1 line. Soft call-to-action, referencing SmartEnneagram and 'link in bio' when appropriate.";
    case "altText":
      return "1-2 sentences describing the visual for accessibility + SEO.";
    case "hashtags":
      return "Space-separated hashtags, 15-25 for IG, 3-5 for LinkedIn.";
    default:
      return "Translate naturally, preserving length and register.";
  }
}
