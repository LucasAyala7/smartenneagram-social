import { prisma } from "./db";

export type CitationPick = {
  id: number;
  type: number;
  category: string;
  author: string;
  work: string;
  year: number;
  page: number;
  hasPage: boolean;
  quote: string;
};

// Seleciona até N citações relevantes ao brief.
// Regras:
// - prioriza citações com hasPage=true (44% do acervo — ativo raro)
// - filtra por type e (opcional) category
// - evita citações usadas nos últimos 60 dias
export async function pickCitations(params: {
  type: number;
  category?: string;
  author?: string;
  limit?: number;
  requirePage?: boolean;
}): Promise<CitationPick[]> {
  const { type, category, author, limit = 6, requirePage = true } = params;

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const baseWhere: any = {
    type,
    ...(category ? { category } : {}),
    ...(author ? { author } : {}),
    OR: [{ usedAt: null }, { usedAt: { lt: sixtyDaysAgo } }]
  };

  // 1ª tentativa: com page obrigatório
  if (requirePage) {
    const withPage = await prisma.citation.findMany({
      where: { ...baseWhere, hasPage: true },
      take: limit,
      orderBy: [{ usedAt: "asc" }, { id: "asc" }]
    });
    if (withPage.length >= Math.min(3, limit)) return withPage;
  }

  // Fallback: sem exigência de page
  const any = await prisma.citation.findMany({
    where: baseWhere,
    take: limit,
    orderBy: [{ hasPage: "desc" }, { usedAt: "asc" }, { id: "asc" }]
  });
  return any;
}

export async function markCitationUsed(id: number) {
  await prisma.citation.update({
    where: { id },
    data: { usedAt: new Date() }
  });
}

export async function getTypeMeta(type: number) {
  const row = await prisma.typeMeta.findUnique({ where: { type } });
  if (!row) return null;
  return {
    type: row.type,
    name: row.name,
    research: JSON.parse(row.researchJson || "{}"),
    big5: JSON.parse(row.big5Json || "{}"),
    answerDefaults: JSON.parse(row.answerDefaults || "{}")
  };
}

export async function listCategories(type: number): Promise<string[]> {
  const rows = await prisma.citation.findMany({
    where: { type },
    select: { category: true },
    distinct: ["category"]
  });
  return rows.map((r) => r.category).sort();
}
