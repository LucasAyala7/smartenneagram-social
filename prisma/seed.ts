import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type RawCitation = {
  category: string;
  author: string;
  work: string;
  year: number;
  page: number;
  quote: string;
  translated?: boolean;
};

type RawTypeFile = {
  type: number;
  name: string;
  citations: RawCitation[];
  answer_defaults?: unknown;
  research_data?: unknown;
  big5_correlation?: unknown;
};

function resolveAcervoPath(): string {
  // Prioridade: env > ./acervo relativo ao cwd > fallback dev
  if (process.env.ACERVO_PATH && fs.existsSync(process.env.ACERVO_PATH)) {
    return process.env.ACERVO_PATH;
  }
  const projectLocal = path.join(process.cwd(), "acervo");
  if (fs.existsSync(projectLocal)) return projectLocal;
  const devFallback = "C:/Users/lucas 1/Desktop/LUCAS/lps/acervo enneagram/output";
  if (fs.existsSync(devFallback)) return devFallback;
  return projectLocal; // mesmo que não exista, pra mensagem de erro ser consistente
}

async function main() {
  const acervoPath = resolveAcervoPath();

  if (!fs.existsSync(acervoPath)) {
    console.error(`[seed] acervo não encontrado. Tentei: ${acervoPath}`);
    console.error(`[seed] Defina ACERVO_PATH ou coloque os JSONs em ./acervo/`);
    process.exit(1);
  }

  console.log(`[seed] Lendo acervo de: ${acervoPath}`);

  // Limpa citations/types (não mexe em Post/Config)
  await prisma.citation.deleteMany();
  await prisma.typeMeta.deleteMany();

  let totalCitations = 0;

  for (let t = 1; t <= 9; t++) {
    const file = path.join(acervoPath, `type_${t}.json`);
    if (!fs.existsSync(file)) {
      console.warn(`[seed] type_${t}.json não encontrado — pulando`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as RawTypeFile;

    await prisma.typeMeta.create({
      data: {
        type: raw.type,
        name: raw.name || `Type ${t}`,
        researchJson: JSON.stringify(raw.research_data ?? {}),
        big5Json: JSON.stringify(raw.big5_correlation ?? {}),
        answerDefaults: JSON.stringify(raw.answer_defaults ?? {})
      }
    });

    const batch = raw.citations.map((c) => ({
      type: raw.type,
      category: c.category || "uncategorized",
      author: c.author || "Unknown",
      work: c.work || "",
      year: Number(c.year) || 0,
      page: Number(c.page) || 0,
      hasPage: Number(c.page) > 0,
      quote: c.quote || "",
      translated: Boolean(c.translated)
    }));

    // batching pra não estourar SQLite
    const chunkSize = 500;
    for (let i = 0; i < batch.length; i += chunkSize) {
      await prisma.citation.createMany({ data: batch.slice(i, i + chunkSize) });
    }

    totalCitations += batch.length;
    console.log(`[seed] Type ${raw.type} (${raw.name}): ${batch.length} citações`);
  }

  console.log(`[seed] Total: ${totalCitations} citações importadas`);

  // Config defaults (editáveis pela /admin/config)
  const defaults: { key: string; value: string }[] = [
    { key: "ai_provider_default", value: process.env.AI_PROVIDER_DEFAULT || "hybrid" },
    { key: "ai_model_claude", value: process.env.AI_MODEL_CLAUDE || "claude-opus-4-7" },
    { key: "ai_model_gpt", value: process.env.AI_MODEL_GPT || "gpt-4o" },
    { key: "anthropic_api_key", value: process.env.ANTHROPIC_API_KEY || "" },
    { key: "openai_api_key", value: process.env.OPENAI_API_KEY || "" }
  ];

  for (const d of defaults) {
    await prisma.config.upsert({
      where: { key: d.key },
      update: {},
      create: d
    });
  }
  console.log(`[seed] Config defaults inseridos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
