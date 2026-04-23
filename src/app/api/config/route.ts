import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const ALLOWED_KEYS = new Set([
  "ai_provider_default",
  "ai_model_claude",
  "ai_model_gpt",
  "anthropic_api_key",
  "openai_api_key"
]);

export async function GET() {
  const rows = await prisma.config.findMany({ where: { key: { in: Array.from(ALLOWED_KEYS) } } });
  const map: Record<string, string> = {};
  for (const r of rows) {
    // Não expor chaves completas — só mostra se está setada
    if (r.key.endsWith("_api_key")) {
      map[r.key] = r.value ? `••••${r.value.slice(-4)}` : "";
    } else {
      map[r.key] = r.value;
    }
  }
  return NextResponse.json({ config: map });
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const updates: { key: string; value: string }[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) continue;
      if (typeof value !== "string") continue;
      // Se o valor for o masked, ignora (não regrava)
      if (value.startsWith("••••")) continue;
      updates.push({ key, value });
    }

    for (const u of updates) {
      await prisma.config.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: u
      });
    }

    return NextResponse.json({ ok: true, updated: updates.map((u) => u.key) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
