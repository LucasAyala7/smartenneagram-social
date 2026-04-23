import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const counts = {
    total: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    ready: posts.filter((p) => p.status === "ready").length,
    approved: posts.filter((p) => p.status === "approved").length,
    published: posts.filter((p) => p.status === "published").length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geração de posts para Instagram e LinkedIn a partir do acervo de 5.513 citações.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/new">
            <Plus className="w-4 h-4" /> Novo post
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Draft" value={counts.draft} />
        <StatCard label="Ready" value={counts.ready} />
        <StatCard label="Approved" value={counts.approved} />
        <StatCard label="Published" value={counts.published} />
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Nenhum post ainda. Clica em <strong>Novo post</strong> pra começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => {
            const out = safeParse(p.outputJson);
            return (
              <Link key={p.id} href={`/posts/${p.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline">#{p.id}</Badge>
                        <Badge variant="secondary">{p.network.replace("_", " ")}</Badge>
                        <Badge>{p.model}</Badge>
                        <Badge variant="outline">Type {p.typeTarget}</Badge>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <CardTitle className="text-base leading-snug">
                      {out?.hook || "(sem hook)"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {out?.insight || ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString("pt-BR")} · pillar {p.pillar} · {p.aiProvider}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    draft: "outline",
    ready: "secondary",
    approved: "success",
    scheduled: "warning",
    published: "default"
  };
  return <Badge variant={map[status] || "outline"}>{status}</Badge>;
}

function safeParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
