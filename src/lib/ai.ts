import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getConfig } from "./db";
import { buildSystemPrompt, buildUserBrief, type GenerationBrief } from "./prompts";

export type GenerationResult = {
  provider: "claude" | "gpt" | "hybrid";
  raw: string;
  parsed: any;
  tokensIn?: number;
  tokensOut?: number;
};

async function clients() {
  const [anthropicKey, openaiKey, claudeModel, gptModel] = await Promise.all([
    getConfig("anthropic_api_key", process.env.ANTHROPIC_API_KEY || ""),
    getConfig("openai_api_key", process.env.OPENAI_API_KEY || ""),
    getConfig("ai_model_claude", process.env.AI_MODEL_CLAUDE || "claude-opus-4-7"),
    getConfig("ai_model_gpt", process.env.AI_MODEL_GPT || "gpt-4o")
  ]);

  return {
    anthropic: anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null,
    openai: openaiKey ? new OpenAI({ apiKey: openaiKey }) : null,
    claudeModel,
    gptModel
  };
}

function parseJson(raw: string): any {
  // IA às vezes embrulha em ```json ... ```
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // Última tentativa: extrair primeiro {...} balanceado
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    throw new Error("Failed to parse JSON from AI response");
  }
}

async function runClaude(brief: GenerationBrief): Promise<GenerationResult> {
  const { anthropic, claudeModel } = await clients();
  if (!anthropic) throw new Error("Anthropic API key not set. Configure em /admin/config.");

  const res = await anthropic.messages.create({
    model: claudeModel,
    max_tokens: 4096,
    system: buildSystemPrompt({
      typeTarget: brief.typeTarget,
      model: brief.model as any,
      pillar: brief.pillar as any
    }),
    messages: [{ role: "user", content: buildUserBrief(brief) }]
  });

  const raw = res.content
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("\n");

  return {
    provider: "claude",
    raw,
    parsed: parseJson(raw),
    tokensIn: res.usage?.input_tokens,
    tokensOut: res.usage?.output_tokens
  };
}

async function runGpt(brief: GenerationBrief): Promise<GenerationResult> {
  const { openai, gptModel } = await clients();
  if (!openai) throw new Error("OpenAI API key not set. Configure em /admin/config.");

  const res = await openai.chat.completions.create({
    model: gptModel,
    response_format: { type: "json_object" },
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt({
          typeTarget: brief.typeTarget,
          model: brief.model as any,
          pillar: brief.pillar as any
        })
      },
      { role: "user", content: buildUserBrief(brief) }
    ]
  });

  const raw = res.choices[0]?.message?.content || "";
  return {
    provider: "gpt",
    raw,
    parsed: parseJson(raw),
    tokensIn: res.usage?.prompt_tokens,
    tokensOut: res.usage?.completion_tokens
  };
}

// Hybrid: Claude gera denso + GPT refina hook/CTA (punch)
async function runHybrid(brief: GenerationBrief): Promise<GenerationResult> {
  const claude = await runClaude(brief);

  const { openai, gptModel } = await clients();
  if (!openai) return { ...claude, provider: "hybrid" }; // fallback

  const refinePrompt = `You are a punchy social copywriter. Below is a post draft in JSON. Rewrite ONLY the "hook" and "cta" fields to be more scroll-stopping and punchy for ${brief.network}. Keep everything else (insight, citation, reflection, hashtags, altText, imagePrompts, layoutJson, ptTranslation, compliance) EXACTLY as is. Return the full JSON with only hook and cta changed.

Draft JSON:
${claude.raw}`;

  try {
    const res = await openai.chat.completions.create({
      model: gptModel,
      response_format: { type: "json_object" },
      max_tokens: 4096,
      messages: [
        { role: "system", content: "Return valid JSON only. No prose." },
        { role: "user", content: refinePrompt }
      ]
    });
    const raw = res.choices[0]?.message?.content || claude.raw;
    return {
      provider: "hybrid",
      raw,
      parsed: parseJson(raw),
      tokensIn: (claude.tokensIn || 0) + (res.usage?.prompt_tokens || 0),
      tokensOut: (claude.tokensOut || 0) + (res.usage?.completion_tokens || 0)
    };
  } catch (err) {
    console.warn("[ai] hybrid refinement failed, returning claude output:", err);
    return { ...claude, provider: "hybrid" };
  }
}

export async function generatePost(
  brief: GenerationBrief,
  providerOverride?: string
): Promise<GenerationResult> {
  const provider =
    providerOverride ||
    (await getConfig("ai_provider_default", process.env.AI_PROVIDER_DEFAULT || "hybrid"));

  switch (provider) {
    case "claude":
      return runClaude(brief);
    case "gpt":
      return runGpt(brief);
    case "hybrid":
    default:
      return runHybrid(brief);
  }
}
