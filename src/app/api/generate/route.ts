import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pickCitations, getTypeMeta, markCitationUsed } from "@/lib/acervo";
import { generatePost } from "@/lib/ai";
import type { GenerationBrief } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      network,
      pillar,
      model,
      typeTarget,
      wing,
      instinct,
      angle,
      trigger,
      locale,
      depth,
      userPrompt,
      chosenCitationId,
      category,
      author,
      provider // opcional: override do config
    } = body;

    if (!network || !pillar || !model || !typeTarget || !angle || !trigger) {
      return NextResponse.json(
        { error: "Campos obrigatórios: network, pillar, model, typeTarget, angle, trigger" },
        { status: 400 }
      );
    }

    const meta = await getTypeMeta(Number(typeTarget));
    if (!meta) {
      return NextResponse.json({ error: `TypeMeta não encontrado para type ${typeTarget}` }, { status: 404 });
    }

    // 1. Pega candidatas de citação (se user escolheu, ainda pega lista pra IA ter contexto)
    const citations = await pickCitations({
      type: Number(typeTarget),
      category,
      author,
      limit: 6,
      requirePage: true
    });

    if (citations.length === 0) {
      return NextResponse.json({ error: "Nenhuma citação encontrada para esse type/category." }, { status: 404 });
    }

    const brief: GenerationBrief = {
      network,
      pillar,
      model,
      typeTarget: Number(typeTarget),
      typeName: meta.name,
      wing: wing ? Number(wing) : null,
      instinct: instinct || null,
      angle,
      trigger,
      locale: locale || "neutral",
      depth: depth || "balanced",
      userPrompt: userPrompt || "",
      citations,
      chosenCitationId: chosenCitationId ? Number(chosenCitationId) : null,
      big5: meta.big5,
      research: meta.research
    };

    // 2. Chama IA
    const result = await generatePost(brief, provider);

    // 3. Extrai citation id usada
    const usedCitationId: number | null =
      result.parsed?.citationBlock?.citationId ?? chosenCitationId ?? null;

    // 4. Salva Post
    const post = await prisma.post.create({
      data: {
        network,
        pillar,
        model,
        typeTarget: Number(typeTarget),
        wing: wing ? Number(wing) : null,
        instinct: instinct || null,
        angle,
        trigger,
        locale: locale || "neutral",
        depth: depth || "balanced",
        userPrompt: userPrompt || "",
        citationId: usedCitationId,
        aiProvider: result.provider,
        outputJson: JSON.stringify(result.parsed),
        status: "draft"
      }
    });

    return NextResponse.json({
      postId: post.id,
      provider: result.provider,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      output: result.parsed
    });
  } catch (err: any) {
    console.error("[generate]", err);
    return NextResponse.json(
      { error: err?.message || "Erro na geração" },
      { status: 500 }
    );
  }
}
