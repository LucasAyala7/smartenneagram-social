import { prisma } from "@/lib/db";
import JSZip from "jszip";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return new Response("not found", { status: 404 });

  const out = JSON.parse(post.outputJson);
  const zip = new JSZip();

  const en =
    [out.hook, "", out.insight, "", out.citationBlock?.rendered || "", "", out.reflection, "", out.cta, "", (out.hashtags || []).join(" ")]
      .filter((x) => x !== undefined)
      .join("\n");

  const pt = out.ptTranslation
    ? [
        out.ptTranslation.hook,
        "",
        out.ptTranslation.insight,
        "",
        out.ptTranslation.citationBlock || "",
        "",
        out.ptTranslation.reflection,
        "",
        out.ptTranslation.cta
      ].join("\n")
    : "";

  const promptsText = (out.imagePrompts || [])
    .map((p: string, i: number) => `--- PROMPT ${i + 1} ---\n${p}`)
    .join("\n\n");

  const instrucoes = `INSTRUÇÕES PARA SAMARA — post #${post.id}
Rede: ${post.network}
Pilar: ${post.pillar}
Modelo: ${post.model}
Type: ${post.typeTarget}${post.wing ? "w" + post.wing : ""}${post.instinct ? " " + post.instinct : ""}
IA usada: ${post.aiProvider}

-------------------------------------
1) TEXTO (caption)
-------------------------------------
- Abrir en_caption.txt e colar a legenda completa no Instagram/LinkedIn.
- O pt_caption.txt é só referência (o que vai postado é a versão EN).

-------------------------------------
2) IMAGEM
-------------------------------------
- Abrir image_prompts.txt.
- Colar cada prompt no Nano Banana (ou mandar pra designer).
- Canvas sugerido: veja layout.json → canvas
- Layout JSON explica onde vai cada camada (foto, overlay, logo, headline).

-------------------------------------
3) CHECKLIST FINAL
-------------------------------------
- [ ] Alt text preenchido no IG/LinkedIn (alt_text.txt)
- [ ] Link da bio atualizado se for CTA
- [ ] Lucas aprovou (status = approved)
- [ ] Citação com página mencionada no post

${out.compliance ? "COMPLIANCE CHECK:\n" + JSON.stringify(out.compliance, null, 2) : ""}
`;

  zip.file("en_caption.txt", en);
  zip.file("pt_caption.txt", pt);
  zip.file("image_prompts.txt", promptsText);
  zip.file("layout.json", JSON.stringify(out.layoutJson || {}, null, 2));
  zip.file("alt_text.txt", out.altText || "");
  zip.file("hashtags.txt", (out.hashtags || []).join(" "));
  zip.file("INSTRUCOES_SAMARA.md", instrucoes);
  zip.file("_full_output.json", JSON.stringify(out, null, 2));

  const buffer = await zip.generateAsync({ type: "uint8array" });
  const body = new Blob([buffer as unknown as BlobPart], { type: "application/zip" });

  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="post_${post.id}_type${post.typeTarget}_${post.model}.zip"`
    }
  });
}
