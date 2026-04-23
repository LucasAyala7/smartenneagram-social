"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Save } from "lucide-react";

export function ConfigForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState({
    ai_provider_default: initial.ai_provider_default || "hybrid",
    ai_model_claude: initial.ai_model_claude || "claude-opus-4-7",
    ai_model_gpt: initial.ai_model_gpt || "gpt-4o",
    anthropic_api_key: "",
    openai_api_key: ""
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ai_provider_default: form.ai_provider_default,
        ai_model_claude: form.ai_model_claude,
        ai_model_gpt: form.ai_model_gpt
      };
      if (form.anthropic_api_key) payload.anthropic_api_key = form.anthropic_api_key;
      if (form.openai_api_key) payload.openai_api_key = form.openai_api_key;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Config salvo");
      setForm((f) => ({ ...f, anthropic_api_key: "", openai_api_key: "" }));
      // força refresh do mask
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Default provider</Label>
            <Select
              value={form.ai_provider_default}
              onChange={(e) => setForm((f) => ({ ...f, ai_provider_default: e.target.value }))}
            >
              <option value="claude">Claude (denso, citação precisa)</option>
              <option value="gpt">GPT (hooks punch, copy)</option>
              <option value="hybrid">Híbrido — Claude + GPT refina</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Claude model</Label>
              <Input
                value={form.ai_model_claude}
                onChange={(e) => setForm((f) => ({ ...f, ai_model_claude: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>GPT model</Label>
              <Input
                value={form.ai_model_gpt}
                onChange={(e) => setForm((f) => ({ ...f, ai_model_gpt: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chaves de API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Anthropic API Key</Label>
            <Input
              type="password"
              placeholder={initial.anthropic_api_key || "sk-ant-..."}
              value={form.anthropic_api_key}
              onChange={(e) => setForm((f) => ({ ...f, anthropic_api_key: e.target.value }))}
            />
            {initial.anthropic_api_key && (
              <p className="text-xs text-muted-foreground">
                Atual: <code>{initial.anthropic_api_key}</code> (deixe em branco pra manter)
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>OpenAI API Key</Label>
            <Input
              type="password"
              placeholder={initial.openai_api_key || "sk-..."}
              value={form.openai_api_key}
              onChange={(e) => setForm((f) => ({ ...f, openai_api_key: e.target.value }))}
            />
            {initial.openai_api_key && (
              <p className="text-xs text-muted-foreground">
                Atual: <code>{initial.openai_api_key}</code> (deixe em branco pra manter)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4" /> Salvar config
        </Button>
      </div>
    </form>
  );
}
