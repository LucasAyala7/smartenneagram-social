import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markCitationUsed } from "@/lib/acervo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  const data: any = {};
  if (body.outputJson !== undefined) data.outputJson = body.outputJson;
  if (body.status !== undefined) data.status = body.status;
  if (body.scheduledFor !== undefined) data.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;

  const post = await prisma.post.update({ where: { id }, data });

  // Se marcou como published, registra usedAt da citação (anti-repetição)
  if (body.status === "published" && post.citationId) {
    await markCitationUsed(post.citationId);
    await prisma.post.update({ where: { id }, data: { publishedAt: new Date() } });
  }

  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
