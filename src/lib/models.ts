// Definição dos 9 modelos visuais do brainstorm.
// Cada modelo especifica: canvas, layers esperados, prompt de imagem, instruções PT.

export type ModelId =
  | "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | "M9";

export type ModelDef = {
  id: ModelId;
  label: string;
  description: string; // em PT pra Samara
  canvasDefault: string; // WxH
  imageCount: number | "carousel"; // "carousel" = múltiplas (3-10)
  styleHint: string; // pra guiar o prompt de imagem
  layoutNote: string; // instrução de diagramação
};

export const MODELS: Record<ModelId, ModelDef> = {
  M1: {
    id: "M1",
    label: "Photo + Brand + Headline",
    description:
      "Foto semi-cinematográfica de pessoa (à janela, no metrô, etc) + logo + headline curta por cima + legenda longa com citação.",
    canvasDefault: "1080x1350",
    imageCount: 1,
    styleHint:
      "cinematic photo, natural light, realistic human, introspective mood, soft color grading, shallow depth of field",
    layoutNote:
      "Foto ocupa 100% do canvas. Gradient overlay inferior (preto->transparente, 40%). Logo no canto superior direito (50px). Headline em Inter Bold 72pt, cor branca, alinhado inferior-esquerdo com margem 80px."
  },
  M2: {
    id: "M2",
    label: "Torn Paper / News Style",
    description:
      "Estética papel rasgado / manchete de jornal. Título provocativo estilo pesquisa.",
    canvasDefault: "1080x1350",
    imageCount: 1,
    styleHint:
      "torn newspaper texture, grainy paper, serif typography, editorial magazine aesthetic, muted tones, subtle sepia",
    layoutNote:
      "Fundo papel rasgado. Headline serif (Playfair Display Black 84pt). Subheadline em itálico com tamanho menor. Logo discreto no rodapé."
  },
  M3: {
    id: "M3",
    label: "Carousel Deep-Dive",
    description:
      "Carrossel de 8-10 slides. Capa forte + miolo denso + CTA final.",
    canvasDefault: "1080x1350",
    imageCount: "carousel",
    styleHint:
      "consistent visual system across slides, clean layout, brand-aligned typography, subtle illustrations or photography",
    layoutNote:
      "Slide 1 = capa com hook. Slides 2-N = 1 conceito por slide (título + 2-3 linhas de texto + opcional: ícone ou mini-foto). Último slide = CTA + link bio."
  },
  M4: {
    id: "M4",
    label: "Interactive / Quiz",
    description:
      "Post com pergunta que convida interação (stickers no story, ou choose A/B/C no feed).",
    canvasDefault: "1080x1350",
    imageCount: 1,
    styleHint:
      "bold minimalist design, large typography, 2-3 option cards, engaging color contrast",
    layoutNote:
      "Título no topo (pergunta). 2-4 cards visuais lado a lado ou empilhados com opções (A, B, C, D). CTA: 'Salva pra descobrir seu tipo'."
  },
  M5: {
    id: "M5",
    label: "Citation Card (DNA do perfil)",
    description:
      "Card tipográfico puro. Só citação + autor + obra + ano + página. Textura sutil de fundo.",
    canvasDefault: "1080x1080",
    imageCount: 1,
    styleHint:
      "minimalist typography poster, paper texture background, elegant serif font, no imagery, editorial feel",
    layoutNote:
      "Citação centralizada (serif, 54pt). Linha fina abaixo. Autor + obra + ano + página em caixa alta (12pt, letter-spacing 2px). Logo pequeno rodapé."
  },
  M6: {
    id: "M6",
    label: "Split-Screen Comparison",
    description:
      "Duas colunas comparando tipos, wings, ou healthy vs unhealthy.",
    canvasDefault: "1080x1350",
    imageCount: 1,
    styleHint:
      "symmetrical split-screen composition, two tonal palettes, clear visual dichotomy",
    layoutNote:
      "Divisão vertical 50/50. Cada lado = 1 cor dominante + título grande (tipo) + 3-4 traits em bullets. Linha divisória central fina."
  },
  M7: {
    id: "M7",
    label: "Celebrity Type Deconstruction",
    description:
      "Carrossel analisando celebridade. Hedging language obrigatório ('reads as', 'appears to exhibit').",
    canvasDefault: "1080x1350",
    imageCount: "carousel",
    styleHint:
      "stylized portrait (if rights allow) or abstract silhouette, magazine-style layout, quote callouts, evidence-based tone",
    layoutNote:
      "Slide 1: 'Why [Celebrity] reads as Type X'. Slides seguintes: 1 traço + 1 evidência pública + citação teórica. Disclaimer final: interpretação baseada em material público."
  },
  M8: {
    id: "M8",
    label: "Reel / Short Video",
    description:
      "15-30s. Hook + 1 insight + citação narrada + CTA. Vertical 9:16.",
    canvasDefault: "1080x1920",
    imageCount: 1, // thumbnail
    styleHint:
      "vertical video cover, attention-grabbing first frame, bold title overlay",
    layoutNote:
      "Entregar: [1] prompt do cover, [2] roteiro em blocos temporais (0-3s hook, 3-10s insight, 10-25s citation, 25-30s CTA), [3] sugestão de B-roll."
  },
  M9: {
    id: "M9",
    label: "Data Viz / Infographic",
    description:
      "Gráfico/infográfico. Forte no LinkedIn (dados de pesquisa, Big Five correlations).",
    canvasDefault: "1080x1350",
    imageCount: 1,
    styleHint:
      "clean infographic, data visualization, sans-serif typography, limited color palette, minimalist charts",
    layoutNote:
      "Título no topo + 1 gráfico central (bar/radar/scatter) + legenda + fonte/citação no rodapé."
  }
};

export const PILLARS = {
  A: "Signs & Identification",
  B: "Citation of the Day",
  C: "Type in Context (work, relationships, stress, growth)",
  D: "Myth-busting / Comparison",
  E: "Interactive / Quiz",
  F: "Behind the Science (psychometrics, research)"
} as const;

export const NETWORKS = {
  instagram_feed: "Instagram — Feed (1080x1350)",
  instagram_story: "Instagram — Story (1080x1920)",
  instagram_reel: "Instagram — Reel (1080x1920 vídeo)",
  linkedin_post: "LinkedIn — Post padrão",
  linkedin_article: "LinkedIn — Artigo longo"
} as const;

export const ANGLES = [
  "work",
  "relationships",
  "self_discovery",
  "stress",
  "growth",
  "celebrities"
] as const;

export const TRIGGERS = [
  "curiosity",
  "identification",
  "validation",
  "provocation",
  "humor"
] as const;

export const LOCALES = ["neutral", "US", "UK", "CA", "AU"] as const;
export const DEPTHS = ["pop", "balanced", "scholar"] as const;
export const INSTINCTS = ["SP", "SX", "SO"] as const;

export type PillarId = keyof typeof PILLARS;
export type NetworkId = keyof typeof NETWORKS;
