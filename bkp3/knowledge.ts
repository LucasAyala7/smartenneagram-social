// Carrega os MDs da pasta knowledge/ em memória (cache process-wide).
// Injetado no system prompt da IA conforme brief.

import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

type Cache = {
  core: string[];
  types: Record<string, string>; // type_1..type_9
  models: Record<string, string>; // M1..M9
  pillars: Record<string, string>; // A..F
  loadedAt: number;
};

let cache: Cache | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 min

function readMdFilesInDir(dir: string): Record<string, string> {
  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const out: Record<string, string> = {};
  for (const f of files) {
    const key = f.replace(/\.md$/, "");
    out[key] = fs.readFileSync(path.join(dir, f), "utf-8");
  }
  return out;
}

function loadCache(): Cache {
  const coreDir = path.join(KNOWLEDGE_DIR, "core");
  const coreFiles = fs.existsSync(coreDir)
    ? fs
        .readdirSync(coreDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => fs.readFileSync(path.join(coreDir, f), "utf-8"))
    : [];

  return {
    core: coreFiles,
    types: readMdFilesInDir(path.join(KNOWLEDGE_DIR, "types")),
    models: readMdFilesInDir(path.join(KNOWLEDGE_DIR, "models")),
    pillars: readMdFilesInDir(path.join(KNOWLEDGE_DIR, "pillars")),
    loadedAt: Date.now()
  };
}

function getCache(): Cache {
  if (!cache || Date.now() - cache.loadedAt > TTL_MS) {
    cache = loadCache();
  }
  return cache;
}

export type KnowledgeBundle = {
  system: string; // bloco pronto pra colar no system prompt
  stats: {
    coreFiles: number;
    hasType: boolean;
    hasModel: boolean;
    hasPillar: boolean;
    chars: number;
  };
};

export function buildKnowledgeBundle(params: {
  typeTarget: number;
  model: string; // M1..M9
  pillar: string; // A..F
}): KnowledgeBundle {
  const c = getCache();

  const typeKey = `type_${params.typeTarget}`;
  const modelMd = c.models[params.model];
  const pillarMd = c.pillars[params.pillar];
  const typeMd = c.types[typeKey];

  const sections: string[] = [];

  sections.push("# SMARTENNEAGRAM KNOWLEDGE BASE\n\nThe following knowledge is authoritative. Apply it to every generation.\n");

  if (c.core.length > 0) {
    sections.push("## CORE PRINCIPLES (always apply)\n");
    sections.push(c.core.join("\n\n---\n\n"));
  }

  if (typeMd) {
    sections.push("\n## TARGET TYPE KNOWLEDGE\n");
    sections.push(typeMd);
  }

  if (modelMd) {
    sections.push("\n## MODEL KNOWLEDGE\n");
    sections.push(modelMd);
  }

  if (pillarMd) {
    sections.push("\n## PILLAR KNOWLEDGE\n");
    sections.push(pillarMd);
  }

  const system = sections.join("\n");

  return {
    system,
    stats: {
      coreFiles: c.core.length,
      hasType: !!typeMd,
      hasModel: !!modelMd,
      hasPillar: !!pillarMd,
      chars: system.length
    }
  };
}

// Invalida cache manualmente (útil pra dev / depois de editar um md)
export function invalidateKnowledgeCache() {
  cache = null;
}
