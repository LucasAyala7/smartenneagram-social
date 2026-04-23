"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Textos didáticos em PT — aparecem ao clicar no ?
const HELP_TEXT: Record<string, string> = {
  network: "Onde o post vai ser publicado. Instagram Feed = imagem quadrada/vertical ou carrossel. Story = 24h, vertical. Reel = vídeo curto vertical. LinkedIn = post profissional. LinkedIn artigo = texto longo.",
  pillar: "Categoria editorial do conteúdo. A (30% IG) = sinais de identificação ('Signs you're a Type 4'). B (15% IG, 25% LinkedIn) = citação do dia, nosso diferencial. C (20%) = tipo em contextos (trabalho, relacionamentos, stress). D (15%) = mitos e comparações. E (15% IG) = quiz interativo. F (25% LinkedIn) = dados, Big Five, pesquisa.",
  model: "Formato visual. M1 = foto cinematográfica + headline. M2 = manchete estilo papel rasgado. M3 = carrossel de 8-10 slides. M4 = quiz. M5 = card só com citação (DNA do perfil). M6 = split-screen comparação. M7 = celebridade (com hedging). M8 = reel/vídeo. M9 = gráfico/infográfico.",
  typeTarget: "O tipo do Eneagrama alvo do post (1 a 9). Cada tipo tem um core fear, passion e padrão observável — isso guia o conteúdo.",
  wing: "Opcional. A 'asa' do tipo (o tipo vizinho que colore o core). Exemplos: Type 4w3 (mais outward, ambicioso) vs 4w5 (mais introspectivo, filosófico). Use quando quiser especificidade extra.",
  instinct: "Opcional. Variante instintual. SP = Self-Preservation (autopreservação, recursos, corpo). SX = Sexual/One-on-One (intensidade no um-pra-um). SO = Social (grupos, causas). Enriquece MUITO a precisão do post.",
  angle: "Sob qual lente o post aborda o tipo. Work (trabalho), Relationships (relacionamentos), Self-Discovery (autoconhecimento), Stress (sob pressão), Growth (crescimento), Celebrities (figuras públicas).",
  trigger: "Emoção que o post deve provocar no leitor. Curiosity = 'quero saber mais'. Identification = 'sou eu'. Validation = 'finalmente alguém disse'. Provocation = 'discordo/quero debater'. Humor = leveza.",
  depth: "Profundidade teórica. Pop = linguagem fácil, pra IG geral. Balanced = equilíbrio entre acessível e denso (default). Scholar = cita autores, traz Big Five, pra LinkedIn/profissionais.",
  locale: "Variação regional do inglês. Neutral = US spelling seguro pra todo público anglófono (default — comece com isso). US/UK/CA/AU = adapta vocabulário e ortografia pro país específico. Use nas semanas 3-4 pra testar tração.",
  provider: "Qual IA gera o texto. Claude (Opus 4.7) = denso, citação precisa. GPT-4o = hooks com punch, copy direta. Híbrido (recomendado) = Claude escreve o corpo, GPT refina hook e CTA — melhor dos dois mundos. 'Default Config' = usa o provider global.",
  userPrompt: "Opcional. Direcionamento livre em português. Se deixar vazio, a IA monta o post só com os filtros acima. Exemplos: 'post sobre tristeza silenciosa do Type 4 em festas'. 'contraste entre 5w4 e 5w6'. 'reel provocativo sobre Nines dizendo sim sem querer'."
};

type TypeOption = { type: number; name: string };

export function NewPostForm({ types }: { types: TypeOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [openHelp, setOpenHelp] = useState<string | null>(null);

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
    provider: ""
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
          <Field label="Rede" helpKey="network" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.network} onChange={(e) => set("network", e.target.value)}>
              {Object.entries(NETWORKS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pilar editorial" helpKey="pillar" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.pillar} onChange={(e) => set("pillar", e.target.value)}>
              {Object.entries(PILLARS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Modelo visual" helpKey="model" openHelp={openHelp} setOpenHelp={setOpenHelp} full>
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
          <Field label="Type" helpKey="typeTarget" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.typeTarget} onChange={(e) => set("typeTarget", e.target.value)}>
              {types.map((t) => (
                <option key={t.type} value={String(t.type)}>
                  {t.type} — {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Wing (opcional)" helpKey="wing" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.wing} onChange={(e) => set("wing", e.target.value)}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                <option key={w} value={String(w)}>
                  w{w}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Instinct (opcional)" helpKey="instinct" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.instinct} onChange={(e) => set("instinct", e.target.value)}>
              <option value="">—</option>
              <option value="SP">SP — Self-Preservation</option>
              <option value="SX">SX — Sexual / One-on-One</option>
              <option value="SO">SO — Social</option>
            </Select>
          </Field>
          <Field label="Ângulo" helpKey="angle" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.angle} onChange={(e) => set("angle", e.target.value)}>
              {Object.entries(ANGLES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Gatilho emocional" helpKey="trigger" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.trigger} onChange={(e) => set("trigger", e.target.value)}>
              {Object.entries(TRIGGERS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Profundidade" helpKey="depth" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.depth} onChange={(e) => set("depth", e.target.value)}>
              <option value="pop">pop</option>
              <option value="balanced">balanced</option>
              <option value="scholar">scholar</option>
            </Select>
          </Field>
          <Field label="Locale (variação regional)" helpKey="locale" openHelp={openHelp} setOpenHelp={setOpenHelp}>
            <Select value={form.locale} onChange={(e) => set("locale", e.target.value)}>
              <option value="neutral">neutral (default)</option>
              <option value="US">US</option>
              <option value="UK">UK</option>
              <option value="CA">CA</option>
              <option value="AU">AU</option>
            </Select>
          </Field>
          <Field label="Provider IA (override)" helpKey="provider" openHelp={openHelp} setOpenHelp={setOpenHelp}>
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
          <CardTitle>
            Prompt da Samara (opcional)
            <HelpButton
              active={openHelp === "userPrompt"}
              onClick={() => setOpenHelp(openHelp === "userPrompt" ? null : "userPrompt")}
            />
          </CardTitle>
          {openHelp === "userPrompt" && <HelpBox text={HELP_TEXT.userPrompt} onClose={() => setOpenHelp(null)} />}
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
          A IA vai buscar citações com página e construir o post completo em EN + PT.
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

function Field({
  label,
  children,
  full,
  helpKey,
  openHelp,
  setOpenHelp
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  helpKey: string;
  openHelp: string | null;
  setOpenHelp: (v: string | null) => void;
}) {
  const active = openHelp === helpKey;
  return (
    <div className={cn("space-y-1.5", full && "col-span-full")}>
      <div className="flex items-center gap-1">
        <Label className="text-xs">{label}</Label>
        <HelpButton active={active} onClick={() => setOpenHelp(active ? null : helpKey)} />
      </div>
      {active && HELP_TEXT[helpKey] && (
        <HelpBox text={HELP_TEXT[helpKey]} onClose={() => setOpenHelp(null)} />
      )}
      {children}
    </div>
  );
}

function HelpButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full w-4 h-4 text-muted-foreground hover:text-primary transition-colors",
        active && "text-primary"
      )}
      title="Ajuda"
      aria-label="Ajuda"
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
  );
}

function HelpBox({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-xs text-foreground relative pr-8">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fechar ajuda"
      >
        <X className="w-3 h-3" />
      </button>
      {text}
    </div>
  );
}
