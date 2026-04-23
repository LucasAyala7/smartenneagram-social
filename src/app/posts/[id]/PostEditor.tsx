"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select-native";
import { Copy, Download, Save, Trash2, ArrowLeft, Check, AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";

type Block = "hook" | "insight" | "reflection" | "cta" | "altText";

const FIELD_LABELS: Record<string, string> = {
  hook: "Hook",
  insight: "Insight",
  reflection: "Reflection",
  cta: "CTA",
  altText: "Alt Text"
};

export function PostEditor({ postJson, citationJson }: { postJson: string; citationJson: string }) {
  const post = JSON.parse(postJson);
  const citation = JSON.parse(citationJson);
  const [out, setOut] = useState<any>(JSON.parse(post.outputJson));
  const [status, setStatus] = useState(post.status);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);

  const translateContext = {
    type: post.typeTarget,
    pillar: post.pillar,
    model: post.model,
    angle: post.angle
  };

  async function translatePtToEn(field: Block) {
    const ptValue = out.ptTranslation?.[field] || "";
    if (!ptValue.trim()) {
      toast.error("PT está vazio — nada pra traduzir");
      return;
    }
    setTranslating(field);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ptValue, field, context: translateContext })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "erro na tradução");
      // Atualiza o campo EN correspondente
      setOut((o: any) => ({ ...o, [field]: data.translated }));
      toast.success(`${FIELD_LABELS[field]} traduzido`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTranslating(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputJson: JSON.stringify(out), status })
      });
      if (!res.ok) throw new Error("save failed");
      toast.success("Salvo");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!confirm(`Deletar post #${post.id}?`)) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deletado");
      window.location.href = "/";
    }
  }

  function copyBlock(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }

  function copyFullCaption() {
    const parts = [
      out.hook,
      "",
      out.insight,
      "",
      out.citationBlock?.rendered,
      "",
      out.reflection,
      "",
      out.cta,
      "",
      (out.hashtags || []).join(" ")
    ]
      .filter((p) => p !== undefined && p !== null)
      .join("\n");
    navigator.clipboard.writeText(parts);
    toast.success("Caption EN completa copiada");
  }

  function updateEn(key: Block, value: string) {
    setOut((o: any) => ({ ...o, [key]: value }));
  }

  function updatePt(key: string, value: string) {
    setOut((o: any) => ({
      ...o,
      ptTranslation: { ...(o.ptTranslation || {}), [key]: value }
    }));
  }

  const compliance = out.compliance || {};
  const imagePrompts: string[] = out.imagePrompts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Post #{post.id}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">{post.network.replace("_", " ")}</Badge>
            <Badge>{post.model}</Badge>
            <Badge variant="outline">Pilar {post.pillar}</Badge>
            <Badge variant="outline">
              Type {post.typeTarget}
              {post.wing ? `w${post.wing}` : ""}
              {post.instinct ? ` ${post.instinct}` : ""}
            </Badge>
            <Badge variant="outline">{post.angle}</Badge>
            <Badge variant="outline">{post.aiProvider}</Badge>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="draft">draft</option>
            <option value="ready">ready</option>
            <option value="approved">approved</option>
            <option value="scheduled">scheduled</option>
            <option value="published">published</option>
          </Select>
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4" /> Salvar
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/export/${post.id}`}>
              <Download className="w-4 h-4" /> ZIP
            </a>
          </Button>
          <Button variant="destructive" size="icon" onClick={deletePost}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Compliance */}
      <ComplianceCard compliance={compliance} />

      {/* Side-by-side PT (esq) / EN (dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ← ESQUERDA: PT */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🇧🇷 Português (edite aqui)</CardTitle>
            <CardDescription className="text-xs">
              Edite o texto em português. Use o botão <RefreshCcw className="w-3 h-3 inline" /> no lado EN pra traduzir o bloco editado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <BlockField
              label="Hook"
              value={out.ptTranslation?.hook || ""}
              onChange={(v) => updatePt("hook", v)}
            />
            <BlockField
              label="Insight"
              value={out.ptTranslation?.insight || ""}
              onChange={(v) => updatePt("insight", v)}
              rows={5}
            />
            <BlockField
              label="Citation (tradução)"
              value={out.ptTranslation?.citationBlock || ""}
              onChange={(v) => updatePt("citationBlock", v)}
            />
            <BlockField
              label="Reflection"
              value={out.ptTranslation?.reflection || ""}
              onChange={(v) => updatePt("reflection", v)}
            />
            <BlockField
              label="CTA"
              value={out.ptTranslation?.cta || ""}
              onChange={(v) => updatePt("cta", v)}
              rows={2}
            />
            <BlockField
              label="Alt text (tradução)"
              value={out.ptTranslation?.altText || ""}
              onChange={(v) => updatePt("altText", v)}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium">📝 Instruções pra Samara</label>
              <Textarea
                rows={4}
                value={out.ptTranslation?.notesForSamara || ""}
                onChange={(e) => updatePt("notesForSamara", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* → DIREITA: EN (o que vai postado) */}
        <Card className="border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">🇺🇸 English (o que vai postado)</CardTitle>
              <CardDescription className="text-xs mt-1">
                Clica <RefreshCcw className="w-3 h-3 inline" /> no bloco pra re-traduzir do PT editado.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={copyFullCaption}>
              <Copy className="w-3 h-3" /> Copiar tudo
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <EnField
              field="hook"
              label="Hook"
              value={out.hook || ""}
              onChange={(v) => updateEn("hook", v)}
              onRefresh={() => translatePtToEn("hook")}
              onCopy={() => copyBlock(out.hook || "", "Hook")}
              translating={translating === "hook"}
            />
            <EnField
              field="insight"
              label="Insight"
              value={out.insight || ""}
              onChange={(v) => updateEn("insight", v)}
              onRefresh={() => translatePtToEn("insight")}
              onCopy={() => copyBlock(out.insight || "", "Insight")}
              translating={translating === "insight"}
              rows={5}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Citation Block</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyBlock(out.citationBlock?.rendered || "", "Citation")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="border rounded-md p-3 bg-muted/40 text-sm italic">
                {out.citationBlock?.rendered || "(sem citação)"}
              </div>
              {citation && (
                <p className="text-xs text-muted-foreground">
                  Original no acervo: {citation.author}, {citation.work} ({citation.year}
                  {citation.page > 0 ? `, p.${citation.page}` : ""})
                </p>
              )}
            </div>
            <EnField
              field="reflection"
              label="Reflection"
              value={out.reflection || ""}
              onChange={(v) => updateEn("reflection", v)}
              onRefresh={() => translatePtToEn("reflection")}
              onCopy={() => copyBlock(out.reflection || "", "Reflection")}
              translating={translating === "reflection"}
            />
            <EnField
              field="cta"
              label="CTA"
              value={out.cta || ""}
              onChange={(v) => updateEn("cta", v)}
              onRefresh={() => translatePtToEn("cta")}
              onCopy={() => copyBlock(out.cta || "", "CTA")}
              translating={translating === "cta"}
              rows={2}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Hashtags ({(out.hashtags || []).length})</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyBlock((out.hashtags || []).join(" "), "Hashtags")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-xs border rounded-md p-2 bg-muted/40 break-words">
                {(out.hashtags || []).join(" ")}
              </div>
            </div>
            <EnField
              field="altText"
              label="Alt Text (EN)"
              value={out.altText || ""}
              onChange={(v) => updateEn("altText", v)}
              onRefresh={() => translatePtToEn("altText")}
              onCopy={() => copyBlock(out.altText || "", "Alt Text")}
              translating={translating === "altText"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Image prompts + Layout */}
      <Tabs defaultValue="prompts">
        <TabsList>
          <TabsTrigger value="prompts">🎨 Prompts de imagem ({imagePrompts.length})</TabsTrigger>
          <TabsTrigger value="layout">📐 Layout JSON (diagramação)</TabsTrigger>
          <TabsTrigger value="raw">🔍 Output completo</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          <div className="space-y-3">
            {imagePrompts.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum prompt gerado.</p>
            )}
            {imagePrompts.map((p, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Prompt {i + 1}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copyBlock(p, `Prompt ${i + 1}`)}>
                    <Copy className="w-3 h-3" /> Copiar
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={p}
                    rows={5}
                    onChange={(e) => {
                      const next = [...imagePrompts];
                      next[i] = e.target.value;
                      setOut((o: any) => ({ ...o, imagePrompts: next }));
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardContent className="pt-6">
              <pre className="text-xs overflow-auto bg-muted p-4 rounded-md max-h-[500px]">
                {JSON.stringify(out.layoutJson || {}, null, 2)}
              </pre>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={() => copyBlock(JSON.stringify(out.layoutJson || {}, null, 2), "Layout JSON")}
              >
                <Copy className="w-3 h-3" /> Copiar JSON
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardContent className="pt-6">
              <pre className="text-xs overflow-auto bg-muted p-4 rounded-md max-h-[500px]">
                {JSON.stringify(out, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Campo PT simples
function BlockField({
  label,
  value,
  onChange,
  rows = 3
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Campo EN com botão Atualizar (tradução PT→EN) + copy
function EnField({
  field,
  label,
  value,
  onChange,
  onRefresh,
  onCopy,
  translating,
  rows = 3
}: {
  field: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onRefresh: () => void;
  onCopy: () => void;
  translating: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">{label}</label>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={translating}
            title="Re-traduzir do PT editado"
            className="h-7 px-2 text-xs"
          >
            {translating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCcw className="w-3 h-3" />
            )}
            {translating ? " traduzindo..." : " Atualizar EN"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 px-2">
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ComplianceCard({ compliance }: { compliance: Record<string, boolean> }) {
  const entries = Object.entries(compliance);
  if (entries.length === 0) return null;

  const failing = entries.filter(([_, v]) => v === false).length;

  return (
    <Card className={failing > 0 ? "border-amber-300 bg-amber-50/50" : "border-green-300 bg-green-50/50"}>
      <CardContent className="py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium">
          {failing > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <Check className="w-4 h-4 text-green-600" />
          )}
          Compliance
        </div>
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center gap-1 text-xs">
            {v ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            )}
            <span className={v ? "text-muted-foreground" : "font-medium text-amber-900"}>{k}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
