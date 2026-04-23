import { NewPostForm } from "./NewPostForm";
import { getTypeMeta } from "@/lib/acervo";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  // Busca nomes dos 9 tipos pra dropdown
  const metas = await prisma.typeMeta.findMany({ orderBy: { type: "asc" } });
  const types = metas.map((m) => ({ type: m.type, name: m.name }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha o brief. A IA usa o acervo pra escrever EN + PT com citação real.
        </p>
      </div>
      <NewPostForm types={types} />
    </div>
  );
}
