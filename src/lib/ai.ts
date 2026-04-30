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

// Modelos com muitas slides/seções precisam de mais tokens de saída.
// JSON com 10 slides + layout + ptTranslation completa pode passar de 6k tokens.
function maxTokensFor(model: string): number {
  if (model === "M3" || model === "M7") return 12000; // carrossel
  if (model === "M8") return 8000; // reel com script timed
  if (model === "M9") return 6000; // data viz com layoutJson grande
  return 6000; // demais modelos (single-image)
}

function parseJson(raw: string): any {
  if (!raw || !raw.trim()) {
    throw new Error("AI retornou resposta vazia. Tente regenerar.");
  }

  // 1. tira fences markdown se houver
  let s = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // 2. tenta direto
  try {
    return JSON.parse(s);
  } catch {}

  // 3. tenta extrair primeiro objeto {...} balanceado
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = s.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  // 4. fallback: se truncou no meio (max_tokens estourado), tentar reparar
  // fechando aspas/colchetes/chaves abertos. É best-effort.
  try {
    return JSON.parse(repairJson(s));
  } catch {}

  // 5. desisto — erro com info útil
  const preview = s.slice(0, 200).replace(/\n/g, " ");
  const tail = s.slice(-200).replace(/\n/g, " ");
  console.error("[ai parseJson] falhou. raw length:", s.length);
  console.error("[ai parseJson] início:", preview);
  console.error("[ai parseJson] final:", tail);
  throw new Error(
    `JSON inválido (${s.length} chars). Tente regenerar — pode ter sido truncamento. ` +
    `Início: "${preview.slice(0, 80)}..."`
  );
}

// Best-effort: fecha chaves/colchetes abertos e remove vírgula trailing
// pra resgatar JSON truncado por max_tokens.
function repairJson(s: string): string {
  let out = s;
  // Remove tudo após o último colon válido sem valor + corta cauda quebrada
  // Estratégia simples: contar { vs }, [ vs ], aspas
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let lastValidIdx = -1;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      if (!inString) lastValidIdx = i;
      continue;
    }
    if (inString) continue;
    if (c === "{" || c === "[") stack.push(c);
    if (c === "}" || c === "]") {
      stack.pop();
      lastValidIdx = i;
    }
    if (c === "," || c === ":") {
      // marca último delimiter como ponto seguro
    }
  }
  // Se string aberta, fecha
  if (inString) out += '"';
  // Remove vírgula trailing (se cortou no meio de array/object)
  out = out.replace(/,\s*$/, "");
  // Fecha colchetes/chaves abertos
  while (stack.length) {
    const open = stack.pop();
    out += open === "{" ? "}" : "]";
  }
  return out;
}

async function runClaude(brief: GenerationBrief): Promise<GenerationResult> {
  const { anthropic, claudeModel } = await clients();
  if (!anthropic) throw new Error("Anthropic API key not set. Configure em /admin/config.");

  const res = await anthropic.messages.create({
    model: claudeModel,
    max_tokens: maxTokensFor(brief.model),
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

  // Detecta truncamento explícito
  if (res.stop_reason === "max_tokens") {
    console.warn(
      `[ai claude] truncado por max_tokens (model=${brief.model}, max=${maxTokensFor(brief.model)})`
    );
  }

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
    max_tokens: maxTokensFor(brief.model),
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
  if (res.choices[0]?.finish_reason === "length") {
    console.warn(
      `[ai gpt] truncado por max_tokens (model=${brief.model}, max=${maxTokensFor(brief.model)})`
    );
  }

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

  // Pra carrossel (M3/M7) o JSON é grande demais pra fazer round-trip via GPT
  // (custo e risco de truncar). Pula a etapa de refino híbrido.
  if (brief.model === "M3" || brief.model === "M7") {
    return { ...claude, provider: "hybrid" };
  }

  const { openai, gptModel } = await clients();
  if (!openai) return { ...claude, provider: "hybrid" };

  const refinePrompt = `You are a punchy social copywriter. Below is a post draft in JSON. Rewrite ONLY the "hook" and "cta" fields to be more scroll-stopping and punchy for ${brief.network}. Keep everything else (insight, citation, reflection, hashtags, altText, imagePrompts, layoutJson, ptTranslation, compliance) EXACTLY as is. Return the full JSON with only hook and cta changed.

Draft JSON:
${claude.raw}`;

  try {
    const res = await openai.chat.completions.create({
      model: gptModel,
      response_format: { type: "json_object" },
      max_tokens: maxTokensFor(brief.model),
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
