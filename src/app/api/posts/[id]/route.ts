import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { markCitationUsed } from "@/lib/acervo";

export const dynamic = "force-dynamic";

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
  if (body.scheduledFor !== undefined)
    data.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;

  const post = await prisma.post.update({ where: { id }, data });

  if (body.status === "published" && post.citationId) {
    await markCitationUsed(post.citationId);
    await prisma.post.update({ where: { id }, data: { publishedAt: new Date() } });
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);

  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
