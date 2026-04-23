import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ConfigForm } from "./ConfigForm";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = [
  "ai_provider_default",
  "ai_model_claude",
  "ai_model_gpt",
  "anthropic_api_key",
  "openai_api_key"
];

export default async function ConfigPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return notFound();

  const rows = await prisma.config.findMany({ where: { key: { in: ALLOWED_KEYS } } });
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.key.endsWith("_api_key")) {
      map[r.key] = r.value ? `••••${r.value.slice(-4)}` : "";
    } else {
      map[r.key] = r.value;
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Config</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chaves de IA e provider padrão. As chaves são mascaradas depois de salvas.
        </p>
      </div>
      <ConfigForm initial={map} />
    </div>
  );
}
