"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2 } from "lucide-react";

const NETWORKS = {
  instagram_feed: "Instagram — Feed",
  instagram_story: "Instagram — Story",
  instagram_reel: "Instagram — Reel",
  linkedin_post: "LinkedIn — Post",
  linkedin_article: "LinkedIn — Artigo"
};

const PILLARS = {
  A: "A — Signs & Identification",
  B: "B — Citation of the Day",
  C: "C — Type in Context",
  D: "D — Myth-busting / Comparison",
  E: "E — Interactive / Quiz",
  F: "F — Behind the Science"
};

const MODELS = {
  M1: "M1 — Photo + Headline",
  M2: "M2 — Torn Paper / News",
  M3: "M3 — Carousel Deep-Dive",
  M4: "M4 — Interactive / Quiz",
  M5: "M5 — Citation Card",
  M6: "M6 — Split-Screen Comparison",
  M7: "M7 — Celebrity Deconstruction",
  M8: "M8 — Reel / Short Video",
  M9: "M9 — Data Viz / Infographic"
};

const ANGLES = {
  work: "Work",
  relationships: "Relationships",
  self_discovery: "Self-Discovery",
  stress: "Stress",
  growth: "Growth",
  celebrities: "Celebrities"
};

const TRIGGERS = {
  curiosity: "Curiosity",
  identification: "Identification",
  validation: "Validation",
  provocation: "Provocation",
  humor: "Humor"
};

type TypeOption = { type: number; name: string };

export function NewPostForm({ types }: { types: TypeOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const [form, setForm] = useState({
    network: "instagram_feed",
    pillar: "A",
    model: "M1",
    typeTarget: "4",
    wing: "",
    instinct: "",
    angle: "self_discovery",
    trigger: "identification",
    locale: "neutral",
    depth: "balanced",
    userPrompt: "",
    provider: "" // "" = usa default do config
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    toast.loading("Gerando post (Claude/GPT)...", { id: "gen" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          typeTarget: Number(form.typeTarget),
          wing: form.wing ? Number(form.wing) : null,
          instinct: form.instinct || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      toast.success(`Post #${data.postId} gerado via ${data.provider}`, { id: "gen" });
      startTransition(() => router.push(`/posts/${data.postId}`));
    } catch (err: any) {
      toast.error(err.message || "Falha na geração", { id: "gen" });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Rede">
            <Select value={form.network} onChange={(e) => set("network", e.target.value)}>
              {Object.entries(NETWORKS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pilar editorial">
            <Select value={form.pillar} onChange={(e) => set("pillar", e.target.value)}>
              {Object.entries(PILLARS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Modelo visual" full>
            <Select value={form.model} onChange={(e) => set("model", e.target.value)}>
              {Object.entries(MODELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Field label="Type">
            <Select value={form.typeTarget} onChange={(e) => set("typeTarget", e.target.value)}>
              {types.map((t) => (
                <option key={t.type} value={String(t.type)}>
                  {t.type} — {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Wing (opcional)">
            <Select value={form.wing} onChange={(e) => set("wing", e.target.value)}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                <option key={w} value={String(w)}>
                  w{w}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Instinct (opcional)">
            <Select value={form.instinct} onChange={(e) => set("instinct", e.target.value)}>
              <option value="">—</option>
              <option value="SP">SP — Self-Preservation</option>
              <option value="SX">SX — Sexual / One-on-One</option>
              <option value="SO">SO — Social</option>
            </Select>
          </Field>
          <Field label="Ângulo">
            <Select value={form.angle} onChange={(e) => set("angle", e.target.value)}>
              {Object.entries(ANGLES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Gatilho emocional">
            <Select value={form.trigger} onChange={(e) => set("trigger", e.target.value)}>
              {Object.entries(TRIGGERS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Profundidade">
            <Select value={form.depth} onChange={(e) => set("depth", e.target.value)}>
              <option value="pop">pop</option>
              <option value="balanced">balanced</option>
              <option value="scholar">scholar</option>
            </Select>
          </Field>
          <Field label="Locale (variação regional)">
            <Select value={form.locale} onChange={(e) => set("locale", e.target.value)}>
              <option value="neutral">neutral (default)</option>
              <option value="US">US</option>
              <option value="UK">UK</option>
              <option value="CA">CA</option>
              <option value="AU">AU</option>
            </Select>
          </Field>
          <Field label="Provider IA (override)">
            <Select value={form.provider} onChange={(e) => set("provider", e.target.value)}>
              <option value="">usar default do Config</option>
              <option value="claude">Claude (denso)</option>
              <option value="gpt">GPT (punch)</option>
              <option value="hybrid">Híbrido</option>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt da Samara (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            placeholder="Deixe em branco pra IA gerar com base nos filtros acima. Ou escreva um direcionamento: ex 'post sobre tristeza silenciosa do Type 4 em festas, estilo introspectivo'."
            value={form.userPrompt}
            onChange={(e) => set("userPrompt", e.target.value)}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          A IA vai buscar citações com página do acervo e construir o post completo em EN + PT.
        </p>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Gerar post
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-full" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
