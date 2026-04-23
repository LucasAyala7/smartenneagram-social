import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostEditor } from "./PostEditor";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return notFound();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return notFound();

  let citation = null;
  if (post.citationId) {
    citation = await prisma.citation.findUnique({ where: { id: post.citationId } });
  }

  return <PostEditor postJson={JSON.stringify(post)} citationJson={JSON.stringify(citation)} />;
}
