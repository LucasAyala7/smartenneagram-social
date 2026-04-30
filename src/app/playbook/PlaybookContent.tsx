"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "se_playbook_done_v1";

type Section = {
  id: string;
  title: string;
  subtitle?: string;
};

const SECTIONS: Section[] = [
  { id: "o-que-e", title: "1. O que é o Eneagrama" },
  { id: "definicoes", title: "2. Definições úteis" },
  { id: "tipos", title: "3. Os 9 Tipos" },
  { id: "centros", title: "4. Os 3 Centros (famílias)" },
  { id: "autores", title: "5. Principais autores" },
  { id: "como-funciona", title: "6. Como funciona" },
  { id: "erros-tipos", title: "7. Confusões entre tipos" },
  { id: "mitos", title: "8. Mitos e mal-entendidos" },
  { id: "identificar", title: "9. Como identificar um tipo" },
  { id: "glossario", title: "10. Glossário (EN não se traduz)" },
  { id: "hedging", title: "11. Falando de celebridades" },
  { id: "app", title: "12. Playbook do app" },
  { id: "dicas", title: "13. Dicas de ouro" },
  { id: "nao-fazer", title: "14. O que NÃO fazer" },
  { id: "faq", title: "15. FAQ" },
  { id: "leituras", title: "16. Leituras recomendadas" },
  { id: "brand", title: "17. Brand — logo, cores, tipografia" }
];

export function PlaybookContent() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
    setReady(true);

    // Carrega fontes do brand (DM Sans, DM Serif Display, JetBrains Mono)
    // só quando entra na página /playbook — sem afetar o resto do app
    if (typeof document !== "undefined") {
      const id = "se-brand-fonts";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / SECTIONS.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      {/* TOC lateral */}
      <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Progresso
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold">{doneCount}</span>
            <span className="text-sm text-muted-foreground">/ {SECTIONS.length}</span>
            <span className="text-xs text-muted-foreground ml-auto">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <nav className="rounded-lg border bg-card p-3 space-y-0.5 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent transition",
                done[s.id] && "text-muted-foreground line-through decoration-1"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded border text-xs shrink-0",
                  done[s.id] ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                )}
              >
                {done[s.id] && <Check className="w-3 h-3" />}
              </span>
              <span className="truncate">{s.title}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="space-y-10 min-w-0">
        {SECTIONS.map((s) => (
          <SectionBlock
            key={s.id}
            section={s}
            done={!!done[s.id]}
            onToggle={() => toggle(s.id)}
            ready={ready}
          />
        ))}

        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          Fim do playbook. Dúvidas específicas? Fala com o Lucas. <br />
          Seu progresso fica salvo no navegador — pode voltar a qualquer hora.
        </footer>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  done,
  onToggle,
  ready
}: {
  section: Section;
  done: boolean;
  onToggle: () => void;
  ready: boolean;
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-20 rounded-lg border bg-card p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{section.title}</h2>
        {ready && (
          <button
            onClick={onToggle}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition",
              done
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-background border-input hover:bg-accent"
            )}
          >
            <Check className="w-3.5 h-3.5" />
            {done ? "Concluído" : "Marcar como lido"}
          </button>
        )}
      </div>
      <div className="prose-se">{SECTION_BODIES[section.id]}</div>
    </section>
  );
}

// ============================================================
// Conteúdo das seções (em PT-BR)
// ============================================================

const SECTION_BODIES: Record<string, React.ReactNode> = {
  "o-que-e": (
    <>
      <p>
        O <strong>Eneagrama</strong> é um sistema de <em>personalidade</em> que descreve 9 estruturas
        psicológicas diferentes. Cada uma dessas estruturas tem um{" "}
        <strong>medo central</strong>, um <strong>desejo central</strong>, uma forma típica de
        pensar, sentir e agir — e estratégias inconscientes que a pessoa desenvolveu desde a
        infância pra lidar com o mundo.
      </p>
      <p>
        Pensa no Eneagrama como um <em>mapa de padrões</em>. Ele não diz o que você <strong>é</strong>,
        ele descreve <strong>como você se organizou pra sobreviver</strong>. Dois irmãos criados na
        mesma casa podem ter tipos completamente diferentes porque desenvolveram estratégias
        diferentes diante das mesmas situações.
      </p>
      <h3>O que o Eneagrama <u>não</u> é</h3>
      <ul>
        <li>
          <strong>Não é astrologia</strong> — não tem nada a ver com data de nascimento, signo, lua
          ou número da sorte.
        </li>
        <li>
          <strong>Não é diagnóstico</strong> — é um framework de auto-conhecimento, não substitui
          terapia, psiquiatria ou qualquer avaliação clínica.
        </li>
        <li>
          <strong>Não é MBTI</strong> — o MBTI mede preferências cognitivas (introversão,
          pensamento/sentimento). O Eneagrama mede <em>motivação inconsciente</em> por trás do
          comportamento. Um Type 4 pode ser extrovertido ou introvertido, isso não muda o tipo.
        </li>
        <li>
          <strong>Não é um "teste de personalidade" qualquer</strong> — tem uma tradição longa,
          autores sérios, e um corpo de literatura acadêmica crescente (ainda que não tão forte
          quanto o Big Five).
        </li>
      </ul>
      <h3>Por que importa pro SmartEnneagram</h3>
      <p>
        Nossa marca é <strong>"evidence-based enneagram"</strong>. Cada post deve respeitar a
        seriedade do sistema. Não viramos Eneagrama em astrologia de Instagram. Nossa vantagem é
        ter <strong>5.513 citações reais</strong> de 9 autores canônicos — use isso sempre que
        puder.
      </p>
    </>
  ),

  definicoes: (
    <>
      <p>Os termos que você vai ver o tempo todo, em ordem de uso:</p>
      <dl className="space-y-4">
        <div>
          <dt className="font-semibold">Tipo (Type / Ennea-type)</dt>
          <dd className="text-sm ml-4">
            Uma das 9 estruturas centrais. Se numera de 1 a 9. Toda pessoa tem <em>um</em> tipo
            nuclear, que não muda ao longo da vida (o que muda é o nível de saúde e a expressão).
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Asa (Wing)</dt>
          <dd className="text-sm ml-4">
            O tipo vizinho do seu core que colore sua expressão. Um <strong>Type 4 com asa 3</strong>{" "}
            (escreve-se <code>4w3</code>) é mais voltado pra imagem e ambição. Já <strong>4w5</strong>{" "}
            é mais introspectivo e filosófico. Todo tipo tem duas possibilidades de asa (vizinhas
            no círculo).
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Instinto (Instinctual variant / Subtype)</dt>
          <dd className="text-sm ml-4">
            Uma "lente" primária pela qual o tipo se expressa. Três possíveis:
            <ul className="mt-1 ml-4">
              <li><strong>SP</strong> (<em>Self-Preservation</em>) — foco em recursos, corpo, segurança material</li>
              <li><strong>SX</strong> (<em>Sexual</em> ou <em>One-on-One</em>) — foco em intensidade nas relações 1-1</li>
              <li><strong>SO</strong> (<em>Social</em>) — foco em grupos, causas, pertencimento coletivo</li>
            </ul>
            Ex: <strong>SP Four</strong>, <strong>SX Seven</strong>, <strong>SO Eight</strong>. O instinto muda a cara
            do tipo bem mais do que a asa.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Fixação (Fixation)</dt>
          <dd className="text-sm ml-4">
            O padrão mental/cognitivo de cada tipo. Ex: Type 1 tem fixação de <em>ressentimento</em>, Type 4 de <em>melancolia</em>.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Paixão (Passion)</dt>
          <dd className="text-sm ml-4">
            A emoção-motor de cada tipo — as 9 paixões clássicas. Raiva (1), Orgulho (2), Vaidade (3),
            Inveja (4), Avareza (5), Medo (6), Gula (7), Luxúria/Intensidade (8), Preguiça/Auto-esquecimento (9).
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Virtude (Virtue)</dt>
          <dd className="text-sm ml-4">
            O oposto saudável da paixão — o que o tipo recupera quando está em crescimento.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Centro (Triad)</dt>
          <dd className="text-sm ml-4">
            O Eneagrama divide os 9 tipos em 3 centros de inteligência: <strong>Cabeça</strong> (5-6-7),{" "}
            <strong>Coração</strong> (2-3-4), <strong>Corpo/Gut</strong> (8-9-1). Ver seção 4.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Nível de saúde (Health Level)</dt>
          <dd className="text-sm ml-4">
            Escala de 1 (mais saudável) a 9 (mais patológico), criada por Riso & Hudson. O mesmo tipo
            se comporta MUITO diferente dependendo do nível.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Linhas (Integration / Disintegration)</dt>
          <dd className="text-sm ml-4">
            Cada tipo tem duas flechas conectando-o a outros dois no mapa: uma de <em>crescimento</em>{" "}
            (integração) e uma de <em>estresse</em> (desintegração). Ver seção 6.
          </dd>
        </div>
      </dl>
    </>
  ),

  tipos: (
    <>
      <p>
        Cheatsheet dos 9 tipos. Cada um tem um <strong>medo</strong>, um <strong>desejo</strong> e uma{" "}
        <strong>estratégia</strong> característica.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose text-sm">
        {[
          {
            n: 1,
            name: "O Reformador (The Reformer)",
            fear: "ser defeituoso, imoral, corrupto",
            desire: "ser correto, íntegro, bom",
            strategy: "interioriza um crítico implacável. Ruminação de 'deveria'. Resiste ao prazer culpado.",
            also: "Também conhecido como: O Perfeccionista"
          },
          {
            n: 2,
            name: "O Ajudante (The Helper)",
            fear: "não ser amado, não ser querido",
            desire: "ser amado, ser essencial pro outro",
            strategy: "antecipa necessidade alheia antes de ser pedido. 'Orgulho' = a recusa mascarada de ter suas próprias necessidades.",
            also: "Também conhecido como: O Doador"
          },
          {
            n: 3,
            name: "O Realizador (The Achiever)",
            fear: "ser sem valor sem conquistar nada",
            desire: "ser admirado, bem-sucedido, visto",
            strategy: "vira o que a plateia quer ver. Confunde imagem com identidade. Engole sentimentos pra manter performance.",
            also: "Também conhecido como: O Performer"
          },
          {
            n: 4,
            name: "O Individualista (The Individualist)",
            fear: "não ter identidade própria, ser 'comum'",
            desire: "se encontrar, ter significado único",
            strategy: "foca no que falta. Romantiza o indisponível. Prefere intensidade a contentamento.",
            also: "Também conhecido como: O Romântico"
          },
          {
            n: 5,
            name: "O Investigador (The Investigator)",
            fear: "ser invadido, esgotado, incompetente",
            desire: "ser capaz, auto-suficiente, saber",
            strategy: "minimiza necessidades pra proteger recursos. Retração. Observa mais do que participa.",
            also: "Também conhecido como: O Observador"
          },
          {
            n: 6,
            name: "O Leal (The Loyalist)",
            fear: "ficar sem apoio, não conseguir sobreviver sozinho",
            desire: "ter segurança, apoio, orientação",
            strategy: "escaneia ameaça no ambiente. Loyalty forte. Duvida da própria autoridade. Pode ser fóbico (recua) ou contra-fóbico (ataca o medo).",
            also: "Também conhecido como: O Cético / O Questionador"
          },
          {
            n: 7,
            name: "O Entusiasta (The Enthusiast)",
            fear: "ficar preso em dor, privação",
            desire: "estar satisfeito, livre, realizado",
            strategy: "sublima dor pulando pro próximo plano. FOMO estrutural. Antecipação > aterrissagem.",
            also: "Também conhecido como: O Epicurista"
          },
          {
            n: 8,
            name: "O Desafiador (The Challenger)",
            fear: "ser controlado, machucado, vulnerável",
            desire: "se auto-proteger, decidir o próprio curso",
            strategy: "arma cedo. Diretude, confronto. Nega fraqueza. Protege 'os seus' ferozmente.",
            also: "Também conhecido como: O Protetor"
          },
          {
            n: 9,
            name: "O Pacificador (The Peacemaker)",
            fear: "perda de conexão, conflito, fragmentação",
            desire: "paz interior, harmonia, integração",
            strategy: "adormece pra si mesmo pra manter a paz lá fora. Funde-se com outros/ambiente. Teimosia subterrânea.",
            also: "Também conhecido como: O Mediador"
          }
        ].map((t) => (
          <div key={t.n} className="border rounded-lg p-4 bg-background">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold">
                {t.n}
              </span>
              <strong>{t.name}</strong>
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div><span className="font-medium text-foreground">Medo:</span> {t.fear}</div>
              <div><span className="font-medium text-foreground">Desejo:</span> {t.desire}</div>
              <div><span className="font-medium text-foreground">Estratégia:</span> {t.strategy}</div>
              <div className="text-xs italic pt-1">{t.also}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4">
        <strong>Dica de estudo:</strong> não tenta decorar os 9 de cara. Escolhe 2 que parecem mais "próximos" de você ou
        de pessoas que você conhece bem. Aprofunda esses primeiro. Depois expande.
      </p>
    </>
  ),

  centros: (
    <>
      <p>
        Os 9 tipos se organizam em <strong>3 centros de inteligência</strong> — cada centro tem uma emoção
        dominante e uma forma característica de lidar com o mundo.
      </p>
      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-lg font-semibold mb-2">🧠 Centro da Cabeça</div>
          <div className="text-primary font-medium mb-2">Tipos 5, 6, 7</div>
          <div className="text-muted-foreground space-y-2">
            <p><strong>Emoção-âncora:</strong> Medo (e resposta ao medo)</p>
            <p><strong>Estratégia:</strong> tentam antecipar, planejar, escapar ou retrair.</p>
            <p><strong>Diferenças:</strong></p>
            <ul className="ml-4 list-disc">
              <li><strong>5</strong> retrai pra dentro (cognição)</li>
              <li><strong>6</strong> escaneia ameaça fora (leal/cético)</li>
              <li><strong>7</strong> foge pro próximo plano (sublimação)</li>
            </ul>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-lg font-semibold mb-2">💗 Centro do Coração</div>
          <div className="text-primary font-medium mb-2">Tipos 2, 3, 4</div>
          <div className="text-muted-foreground space-y-2">
            <p><strong>Emoção-âncora:</strong> Vergonha (e construção de imagem)</p>
            <p><strong>Estratégia:</strong> constroem uma imagem pra ser aceito/visto/amado.</p>
            <p><strong>Diferenças:</strong></p>
            <ul className="ml-4 list-disc">
              <li><strong>2</strong> projeta imagem de "amoroso/útil"</li>
              <li><strong>3</strong> projeta imagem de "vencedor"</li>
              <li><strong>4</strong> projeta imagem de "único/diferente"</li>
            </ul>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-lg font-semibold mb-2">🔥 Centro do Corpo (Gut)</div>
          <div className="text-primary font-medium mb-2">Tipos 8, 9, 1</div>
          <div className="text-muted-foreground space-y-2">
            <p><strong>Emoção-âncora:</strong> Raiva (e controle de território)</p>
            <p><strong>Estratégia:</strong> afirmam ou controlam fronteiras corporais/territoriais.</p>
            <p><strong>Diferenças:</strong></p>
            <ul className="ml-4 list-disc">
              <li><strong>8</strong> externaliza raiva (confronto)</li>
              <li><strong>9</strong> adormece a raiva (fusão)</li>
              <li><strong>1</strong> interioriza raiva (auto-crítica)</li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-4">
        <strong>Dica pra posts:</strong> agrupar por centro é uma angulação ótima de conteúdo. Ex:{" "}
        <em>"Por que 8, 9 e 1 são os tipos que mais sentem raiva (mesmo parecendo diferentes)"</em>.
      </p>
    </>
  ),

  autores: (
    <>
      <p>
        Nossa marca se sustenta em <strong>9 autores canônicos</strong>. Entender quem é cada um
        ajuda você a saber quando citar quem. Todos os nomes abaixo estão no nosso acervo e são
        usados pelo gerador.
      </p>
      <div className="not-prose space-y-4 text-sm">
        {[
          {
            name: "Claudio Naranjo",
            obra: "Character and Neurosis (1994)",
            desc: "Psiquiatra chileno. É o autor que mais aprofunda a dimensão psicopatológica dos tipos. Linguagem às vezes clínica. Pioneiro do Eneagrama moderno. Cita se quer 'autoridade acadêmica séria'."
          },
          {
            name: "Don Richard Riso & Russ Hudson",
            obra: "Personality Types, The Wisdom of the Enneagram, Discovering Your Personality Type",
            desc: "A dupla mais popular e acessível. Criaram os 9 níveis de saúde. Linguagem mais pop, mas densa. Nosso maior volume de citações. Cita quando quer algo equilibrado entre profundidade e legibilidade."
          },
          {
            name: "Beatrice Chestnut",
            obra: "The Complete Enneagram (2013), 27 Subtypes",
            desc: "A referência máxima em instintos/subtipos. Se seu post fala de SP/SX/SO, cita ela. Texto moderno e acessível."
          },
          {
            name: "David Daniels & Virginia Price",
            obra: "The Essential Enneagram",
            desc: "Estilo clínico-pragmático. Desenvolveram um mini-teste validado. Bons pra contextos de workplace / desenvolvimento."
          },
          {
            name: "Helen Palmer",
            obra: "The Enneagram in Love and Work",
            desc: "Tradição oral. Baseou sua obra em painéis de entrevistas. Ideal pra citações sobre relacionamentos e trabalho."
          },
          {
            name: "Sandra Maitri",
            obra: "The Spiritual Dimension of the Enneagram",
            desc: "Vertente espiritual / Diamond Approach. Cita quando o post é sobre crescimento interior, Holy Ideas, Essência. Evita em posts mais pop."
          },
          {
            name: "Jerome Wagner",
            obra: "Nine Lenses on the World",
            desc: "Acadêmico com background psicométrico. Liga Eneagrama ao Big Five. Cita em posts de pilar F (Behind the Science)."
          },
          {
            name: "Eric Salmon",
            obra: "A Arte de Interpretar o Eneagrama",
            desc: "Francês, estilo narrativo. Menos famoso, menos citações no acervo, mas bons insights quando aparece."
          },
          {
            name: "Karen Webb",
            obra: "Principles of the Enneagram",
            desc: "Introdutório bom. Boa pra citações mais didáticas."
          }
        ].map((a) => (
          <div key={a.name} className="border-l-4 border-primary/30 pl-4">
            <div className="font-semibold">{a.name}</div>
            <div className="italic text-muted-foreground text-xs">{a.obra}</div>
            <p className="mt-1">{a.desc}</p>
          </div>
        ))}
      </div>
    </>
  ),

  "como-funciona": (
    <>
      <h3>3.1 — Os 9 tipos estão conectados</h3>
      <p>
        O símbolo do Eneagrama não é só um círculo com 9 pontos. Tem linhas ligando tipos entre si.
        Essas linhas têm significado: descrevem <strong>pra onde você vai</strong> quando está
        crescendo e <strong>pra onde você vai</strong> quando está sob estresse.
      </p>
      <h3>3.2 — Linha de estresse (desintegração)</h3>
      <p>
        Quando sob pressão, o tipo pega traços <em>menos saudáveis</em> de outro tipo. Não vira o
        outro — só expressa a sombra daquele tipo.
      </p>
      <ul>
        <li>1 → 4 (perde controle, afunda em melancolia)</li>
        <li>2 → 8 (fica direto/agressivo, "depois de tudo que eu fiz")</li>
        <li>3 → 9 (colapsa, desliga)</li>
        <li>4 → 2 (fica carente, clingy)</li>
        <li>5 → 7 (impulsivo, disperso)</li>
        <li>6 → 3 (over-performance, imagem)</li>
        <li>7 → 1 (rígido, crítico)</li>
        <li>8 → 5 (se isola, cala)</li>
        <li>9 → 6 (ansioso, indeciso)</li>
      </ul>
      <h3>3.3 — Linha de crescimento (integração)</h3>
      <p>
        Quando saudável, pega traços <em>saudáveis</em> de outro tipo.
      </p>
      <ul>
        <li>1 → 7 (relaxa, brinca)</li>
        <li>2 → 4 (conecta com próprias necessidades)</li>
        <li>3 → 6 (lealdade genuína, admite dúvida)</li>
        <li>4 → 1 (disciplina, ação)</li>
        <li>5 → 8 (encarna, toma espaço)</li>
        <li>6 → 9 (confia)</li>
        <li>7 → 5 (profundidade, foco)</li>
        <li>8 → 2 (cuidado, vulnerabilidade)</li>
        <li>9 → 3 (ação direta, se mostra)</li>
      </ul>
      <h3>3.4 — Níveis de saúde (Riso & Hudson)</h3>
      <p>
        Escala 1-9: níveis 1-3 são saudáveis, 4-6 médios, 7-9 patológicos. O mesmo Type 4 no nível 2 é um
        artista equilibrado; no nível 8 é alguém paralisado por auto-ódio. <strong>Sempre que escrever
        sobre um tipo, tenha em mente que você está falando da faixa média (4-6) por default.</strong>
      </p>
      <h3>3.5 — Tritype (opcional)</h3>
      <p>
        Conceito introduzido por Katherine Fauvre: cada pessoa teria um tipo principal de cada centro
        (cabeça, coração, corpo). Ex: <strong>468</strong> significa principal-4, secundário-6, terciário-8.
        Mais avançado — mencione quando for post de pilar F, evite em posts pop.
      </p>
    </>
  ),

  "erros-tipos": (
    <>
      <p>
        Confusões super comuns — pessoas (e IAs mal-calibradas) erram essas o tempo todo. Saber as
        diferenças ajuda a criar posts mais afiados.
      </p>
      <div className="not-prose space-y-4 text-sm">
        {[
          {
            a: "2 vs 9",
            what: "Ambos acomodam os outros.",
            diff: "O 2 <em>persegue ativamente</em> a conexão (antecipa necessidade, se insere). O 9 <em>evita conflito passivamente</em> (some, concorda por fora)."
          },
          {
            a: "3 vs 1",
            what: "Ambos são altamente funcionais, produtivos.",
            diff: "O 1 otimiza pra <em>correto</em>. O 3 otimiza pra <em>vencer/ser visto</em>. 1 sente culpa por descansar; 3 sente que está perdendo vantagem."
          },
          {
            a: "4 vs 6",
            what: "Ambos são ansiosos, sentem muito.",
            diff: "O 4 escaneia <em>pra dentro</em> (o que está faltando em mim?). O 6 escaneia <em>pra fora</em> (o que pode me ameaçar?)."
          },
          {
            a: "5 vs 9",
            what: "Ambos se retraem.",
            diff: "O 5 <em>afia o foco</em> (vai fundo em UM assunto). O 9 <em>embaça</em> (se distribui em muitas distrações, procrastina)."
          },
          {
            a: "6 contra-fóbico vs 8",
            what: "Ambos confrontam, desafiam autoridade.",
            diff: "O 8 confronta <em>de força</em> (não tem medo de verdade). O 6 contra-fóbico confronta <em>de medo</em> (ataca pra conquistar o medo)."
          },
          {
            a: "7 vs 3",
            what: "Ambos são enérgicos, orientados ao futuro.",
            diff: "O 7 busca <em>experiência nova</em> (mais). O 3 busca <em>conquista reconhecida</em> (troféu)."
          },
          {
            a: "8 vs 1",
            what: "Ambos são diretos, 'falam a verdade'.",
            diff: "O 1 é direto pelo <em>princípio</em> (isso está certo). O 8 é direto pelo <em>poder</em> (vou dizer mesmo que dói)."
          },
          {
            a: "4 vs 5",
            what: "Ambos sentem-se 'diferentes', introvertidos.",
            diff: "O 4 <em>mergulha no sentimento</em>. O 5 <em>foge do sentimento pro pensamento</em>."
          }
        ].map((c) => (
          <div key={c.a} className="border rounded-lg p-4 bg-background">
            <div className="font-semibold text-primary mb-1">{c.a}</div>
            <div className="text-muted-foreground mb-2">{c.what}</div>
            <div dangerouslySetInnerHTML={{ __html: c.diff }} />
          </div>
        ))}
      </div>
      <p className="mt-4">
        <strong>Dica:</strong> posts de comparação (modelo M6 no app) viralizam. Toda vez que você
        vir uma dessas confusões, é material de post.
      </p>
    </>
  ),

  mitos: (
    <>
      <p>
        Mitos que você vai ver sendo repetidos por aí. Desmontar é material ótimo pra pilar D
        (Myth-busting). Nunca repita esses mitos como se fossem verdade.
      </p>
      <div className="not-prose space-y-3 text-sm">
        {[
          { m: "Fives são anti-sociais", r: "Fives têm poucas relações, mas profundas. Não são antissociais — preservam energia social. Diferente." },
          { m: "Nines são preguiçosos", r: "A 'preguiça' do 9 (sloth) é ESPIRITUAL: se esquecer de si. Pode ser um 9 workaholic que se apaga pros outros. Não é preguiça física." },
          { m: "Fours são depressivos", r: "Fours são melancólico-românticos. Melancolia ≠ depressão clínica. Confundir é patologizar um traço normal." },
          { m: "Eights são bullies", r: "Eights protegem 'os seus'. Podem ser líderes amados, parceiros leais. Chamar de bully é reducionismo." },
          { m: "Sixes são paranoicos", r: "Scan de ameaça ≠ delírio persecutório. Paranoia é termo clínico. Cuidado ao usar." },
          { m: "Sevens são superficiais", r: "Sevens têm profundidade, só evitam dor. Fugir da dor é sofisticado, não raso." },
          { m: "Twos são fakes", r: "A ajuda do 2 é real. O que é inconsciente pra ele é que ele tem necessidades também. Chamar de fake é cruel." },
          { m: "O Eneagrama é astrologia / esoterismo", r: "Tem raiz espiritual (Ichazo, Gurdjieff), mas tem também psicometria em desenvolvimento. iEQ9 tem validação publicada. Nossa validação está em construção." },
          { m: "Seu tipo muda com a idade", r: "Tipo nuclear é estável. O que muda é o nível de saúde e a expressão. Um Four mais saudável parece diferente de um Four ferido." },
          { m: "Tipos mais altos são melhores", r: "Números são categóricos. 8 não é 'mais evoluído' que 2. Não existe hierarquia." }
        ].map((x, i) => (
          <div key={i} className="border rounded-lg p-3 bg-background">
            <div className="text-destructive font-medium">❌ Mito: {x.m}</div>
            <div className="mt-1">✓ <strong>Realidade:</strong> {x.r}</div>
          </div>
        ))}
      </div>
    </>
  ),

  identificar: (
    <>
      <h3>Por que é difícil "typear" alguém só olhando</h3>
      <p>
        Comportamento é a <em>ponta do iceberg</em>. O Eneagrama descreve MOTIVAÇÃO, não
        comportamento. Dois tipos podem fazer a mesma coisa por razões completamente diferentes.
      </p>
      <p>
        Ex: uma pessoa organizada pode ser 1 (quer estar correto), 3 (quer parecer profissional),
        5 (quer controlar ambiente) ou 6 (quer evitar erro). Mesmo comportamento, motivações
        diferentes.
      </p>
      <h3>Perguntas mais reveladoras (pra se auto-investigar ou criar conteúdo)</h3>
      <ul>
        <li>Qual é o medo que você <em>não quer admitir</em>?</li>
        <li>Quando você está sob estresse, o que acontece com você (não o que VOCÊ faz)?</li>
        <li>Qual compliment te <em>constrange</em> mais do que te alegra?</li>
        <li>Qual é sua crítica mais cruel a você mesma?</li>
        <li>O que você faz <em>compulsivamente</em> quando fica sozinho?</li>
      </ul>
      <h3>O que fazer quando alguém te pergunta "qual o meu tipo?"</h3>
      <ol>
        <li>Nunca afirme. Sempre use <em>"pode ser um X"</em>, <em>"parece ressoar com X"</em>.</li>
        <li>Sugira 2-3 candidatos e peça pra pessoa ler cada um.</li>
        <li>Remeta ao nosso teste — é pra isso que existe.</li>
        <li>Nunca revele o tipo pra outra pessoa de alguém — é violação de privacidade.</li>
      </ol>
      <h3>Sinal de alerta: não queira typear rápido demais</h3>
      <p>
        Celebridades, personagens, chefes, parceiros — a tentação é grande. Resista. Até na
        literatura séria, há discordância. Riso & Hudson e Chestnut tipam pessoas conhecidas
        diferentemente. Isso é normal.
      </p>
    </>
  ),

  glossario: (
    <>
      <p>
        Termos em inglês que você <strong>não deve traduzir</strong> nos posts finais (EN é o idioma de saída).
        Na versão PT (só sua referência interna), pode usar a tradução.
      </p>
      <div className="not-prose">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 border">EN (usar no post)</th>
              <th className="text-left p-2 border">PT (sua referência interna)</th>
              <th className="text-left p-2 border">Significado</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Type", "Tipo", "Uma das 9 estruturas"],
              ["Wing", "Asa", "Tipo vizinho que colore"],
              ["Instinct / Subtype", "Instinto / Subtipo", "SP, SX, SO"],
              ["Fixation", "Fixação", "Padrão mental"],
              ["Passion", "Paixão", "Emoção-motor"],
              ["Virtue", "Virtude", "Oposto saudável da paixão"],
              ["Holy Idea", "Ideia Santa", "Insight espiritual/essencial"],
              ["Center / Triad", "Centro / Tríade", "Cabeça, Coração, Corpo"],
              ["Health level", "Nível de saúde", "Escala 1-9"],
              ["Integration (arrow)", "Integração", "Movimento saudável"],
              ["Disintegration (arrow)", "Desintegração", "Movimento sob estresse"],
              ["Countertype", "Contra-tipo", "O subtipo que contraria o estereótipo do tipo"],
              ["Tritype", "Tritipo", "Um por centro"],
              ["Core fear", "Medo central", "O que o tipo mais evita"],
              ["Core desire", "Desejo central", "O que o tipo mais busca"]
            ].map(([en, pt, sig]) => (
              <tr key={en} className="border-t">
                <td className="p-2 border font-mono text-xs">{en}</td>
                <td className="p-2 border">{pt}</td>
                <td className="p-2 border text-muted-foreground">{sig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="mt-6">Autores — grafia exata</h3>
      <p className="text-sm">
        Nunca escreva errado o nome dos autores no post. A IA já faz certo, mas você deve conferir:
      </p>
      <ul className="text-sm">
        <li>Claudio Naranjo (não "Claudio Naranjo" sem o "n"; "Naranjo" com J)</li>
        <li>Don Richard Riso &amp; Russ Hudson (sempre os dois juntos; &amp; ou "and")</li>
        <li>Beatrice Chestnut (duas letras "t" em Chestnut)</li>
        <li>David Daniels &amp; Virginia Price</li>
        <li>Helen Palmer (uma "l", duas "l"? → uma só: Palmer)</li>
        <li>Sandra Maitri</li>
        <li>Jerome Wagner</li>
        <li>Eric Salmon</li>
        <li>Karen Webb</li>
      </ul>
    </>
  ),

  hedging: (
    <>
      <h3>🚨 Regra crítica pra posts de celebridade</h3>
      <p className="font-medium">
        Nunca afirme que alguém público é um tipo específico. Use linguagem de hipótese (<em>hedging</em>).
      </p>
      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3 text-sm my-4">
        <div className="border-2 border-destructive/40 rounded-lg p-3 bg-destructive/5">
          <div className="font-semibold text-destructive mb-2">❌ NUNCA diga</div>
          <ul className="space-y-1">
            <li>"Taylor Swift é Type 4w3"</li>
            <li>"Claramente Elon Musk é um 5"</li>
            <li>"Ela com certeza é Type 2"</li>
            <li>"Esse cara é o retrato do Type 8"</li>
          </ul>
        </div>
        <div className="border-2 border-primary/40 rounded-lg p-3 bg-primary/5">
          <div className="font-semibold text-primary mb-2">✅ SEMPRE diga</div>
          <ul className="space-y-1">
            <li>"Taylor Swift <em>reads as</em> Type 4w3"</li>
            <li>"Elon <em>appears to exhibit behaviors consistent with</em> Type 5"</li>
            <li>"Based on public interviews, <em>she may resonate with</em> Type 2"</li>
            <li>"Commonly typed by the community as Type 8"</li>
          </ul>
        </div>
      </div>
      <h3>Disclaimer obrigatório</h3>
      <p>Todo post de celebridade termina com (em inglês):</p>
      <blockquote>
        <em>
          Typing public figures is inherently speculative. This reflects publicly available
          material and common community consensus — not a professional assessment.
        </em>
      </blockquote>
      <h3>Por que isso importa</h3>
      <ul>
        <li><strong>Ético:</strong> tipar sem consentimento é invasivo</li>
        <li><strong>Legal:</strong> difamação por associar alguém a um traço negativo</li>
        <li><strong>Credibilidade:</strong> afirmação absoluta tira nossa autoridade</li>
      </ul>
      <h3>Mesma regra vale pra saúde mental</h3>
      <p>
        Se o post menciona depressão, ansiedade, trauma — <strong>nunca</strong> ligue a um tipo
        como causa. Use <em>"correlaciona com"</em>, <em>"alguns Fours relatam"</em>. Adicione
        disclaimer de fim:
      </p>
      <blockquote>
        <em>
          The Enneagram is a personality framework, not a medical diagnosis. If you're struggling,
          please reach out to a licensed professional.
        </em>
      </blockquote>
    </>
  ),

  app: (
    <>
      <h3>Fluxo completo pra criar um post</h3>
      <ol>
        <li>
          <strong>Home (/)</strong> — lista todos os posts criados. Clique em um pra editar, ou
          <strong> Novo post</strong> pra criar.
        </li>
        <li>
          <strong>/new</strong> — preencha o <em>brief</em>. Cada campo tem um "?" explicando.
          Valores importantes:
          <ul className="mt-2">
            <li><strong>Rede:</strong> Instagram feed (default) ou LinkedIn</li>
            <li><strong>Pilar:</strong> categoria editorial (ver seção 12.1 abaixo)</li>
            <li><strong>Modelo:</strong> formato visual (M1-M9, ver seção 12.2)</li>
            <li><strong>Type:</strong> o tipo foco do post (1-9)</li>
            <li><strong>Ângulo:</strong> work/relationships/stress/growth/celebrities/self-discovery</li>
            <li><strong>Gatilho:</strong> que emoção quer provocar no leitor</li>
            <li><strong>Depth:</strong> <em>pop</em> pra IG, <em>balanced</em> default, <em>scholar</em> pra LinkedIn denso</li>
            <li><strong>Prompt:</strong> opcional — seu direcionamento livre em português</li>
          </ul>
        </li>
        <li>
          Clica <strong>Gerar post</strong>. Demora ~20-40s.
        </li>
        <li>
          Abre o editor: <strong>PT à esquerda</strong> (edite aqui), <strong>EN à direita</strong>{" "}
          (o que vai ser postado). Cada bloco tem botão <strong>🔄 Atualizar EN</strong> que retraduz
          preservando a voz.
        </li>
        <li>
          Ajusta o PT se quiser mudar (ex: "quero mais leve"). Clica 🔄 no bloco EN correspondente.
        </li>
        <li>
          Confere <strong>Compliance Check</strong> (verde = ok, amarelo = precisa atenção).
        </li>
        <li>
          Muda <strong>Status</strong>: draft → ready → approved → scheduled → published.
        </li>
        <li>
          Baixa <strong>ZIP</strong>: pasta com legenda EN, prompts de imagem, layout JSON,
          hashtags, alt text e um <em>INSTRUCOES_SAMARA.md</em> em PT explicando o que fazer.
        </li>
        <li>
          Gera a imagem no <strong>Nano Banana</strong> (ou envia pro designer com o prompt), monta
          o post no Canva com a legenda, posta.
        </li>
      </ol>
      <h3>12.1 — Os 6 pilares editoriais</h3>
      <p>Cada post se encaixa em um desses 6:</p>
      <ul>
        <li><strong>A — Signs &amp; Identification</strong> (30% do IG) — "Sinais que você é um Type X". Alta identificação.</li>
        <li><strong>B — Citation of the Day</strong> (15% IG, 25% LinkedIn) — Uma citação forte do acervo. DNA do perfil.</li>
        <li><strong>C — Type in Context</strong> (20%) — Type em trabalho / relacionamento / estresse.</li>
        <li><strong>D — Myth-busting</strong> (15%) — Desmontar mitos ou comparar tipos confundidos.</li>
        <li><strong>E — Interactive / Quiz</strong> (15%) — Pergunta com opções.</li>
        <li><strong>F — Behind the Science</strong> (5% IG, 25% LinkedIn) — Big Five, validação, dados.</li>
      </ul>
      <h3>12.2 — Os 9 modelos visuais</h3>
      <ul>
        <li><strong>M1</strong> Foto cinematográfica + headline curta (mais flexível)</li>
        <li><strong>M2</strong> Manchete estilo papel rasgado (provocativo)</li>
        <li><strong>M3</strong> Carrossel 8-10 slides (deep-dive)</li>
        <li><strong>M4</strong> Quiz interativo</li>
        <li><strong>M5</strong> Citação pura em tipografia (DNA da marca)</li>
        <li><strong>M6</strong> Split-screen comparando 2 tipos</li>
        <li><strong>M7</strong> Carrossel de celebridade (com hedging!)</li>
        <li><strong>M8</strong> Reel / vídeo curto</li>
        <li><strong>M9</strong> Infográfico / data viz (LinkedIn)</li>
      </ul>
    </>
  ),

  dicas: (
    <>
      <h3>🎯 Dicas de ouro</h3>
      <ol className="space-y-3">
        <li>
          <strong>Prefira sempre citações com página.</strong> Quando você viu "p.157" no post, sabe que
          é verdade verificável. Isso constrói autoridade. Nosso acervo marca quais têm página — o app
          prioriza automaticamente.
        </li>
        <li>
          <strong>Especificidade vence genericidade.</strong> "Fours são sensíveis" é fraco. "Fours
          relem mensagens antigas pra sentir algo" é forte. Sempre pede pra IA descer ao comportamento
          observável.
        </li>
        <li>
          <strong>Se o post soou genérico, regenera.</strong> Você tem liberdade de regerar quantas
          vezes quiser (custa ~$0,28 por geração — nada). Prefira 3 tentativas e escolher a melhor a
          postar uma ruim.
        </li>
        <li>
          <strong>Mistura autores.</strong> Se os últimos 5 posts citaram Riso &amp; Hudson, o próximo
          deve ser Naranjo ou Chestnut. Diversidade de fonte = autoridade.
        </li>
        <li>
          <strong>Use o campo Prompt pra refinar.</strong> Quando o post genérico não serve, manda um
          direcionamento específico: <em>"post sobre o 4w5 introspectivo evitando festas, sem ser
          cliché de 'introvertido'"</em>. A IA responde à sua intenção.
        </li>
        <li>
          <strong>Aprende um tipo por semana.</strong> Em 9 semanas você tem domínio básico dos 9.
          Escolhe o da semana, lê a seção 3 aqui, depois lê pelo menos 1 capítulo de Riso &amp; Hudson
          sobre ele (no Kindle dá 1h).
        </li>
        <li>
          <strong>Salve hooks que funcionam.</strong> Quando um post gera engajamento forte, anota o
          hook. Variações desse hook podem ser usadas em outros tipos.
        </li>
        <li>
          <strong>Pilar B é pra rodar TODO DIA.</strong> Citação do dia é barato de produzir e constrói
          autoridade visual. Tenta manter uma frequência de 4-5 por semana.
        </li>
        <li>
          <strong>Reels (M8) têm prioridade de alcance.</strong> Mesmo que o copy fique mais curto, 1
          reel por semana rende mais que 3 posts estáticos.
        </li>
        <li>
          <strong>Reuse conteúdo entre redes.</strong> Post IG de pilar F → adapta como artigo LinkedIn
          (mais denso). Post LinkedIn de pilar B → vira carrossel IG M3. Pede o Atualizar EN pra refinar.
        </li>
      </ol>
    </>
  ),

  "nao-fazer": (
    <>
      <h3>🚫 O que NÃO fazer nas postagens</h3>
      <div className="space-y-3 text-sm">
        {[
          ["Afirmar tipo de celebridade sem hedging", "Sempre 'reads as', nunca 'is'. Veja seção 11."],
          ["Tipificar alguém nos comentários", "Nunca dê tipo pra pessoas no DM/coments — remeta ao teste."],
          ["Diagnosticar saúde mental", "Nunca ligue um tipo a uma doença como causa. 'Depressão em Fours' não é diagnóstico, é correlação."],
          ["Glamorizar sofrimento do Type 4", "Evite o cliché sad-girl. Fours têm profundidade, não só melancolia."],
          ["Tratar Nines como preguiçosos", "'Sloth' = auto-esquecimento espiritual, NÃO preguiça física."],
          ["Usar Eneagrama com astrologia", "'Type 4 + Peixes' = não misturar frameworks. Quebra a credibilidade."],
          ["Inventar citações", "Se não tem no acervo, não cita. Nunca invente frase atribuída a autor."],
          ["Usar página 'p.X' inventada", "Se a citação não tem página no acervo (page=0), renderiza sem página. Jamais invente."],
          ["Flatten o tipo em estereótipo", "'Todos os 8 são bullies' é cruel e errado. Sempre generalize com 'Eights often…', 'Many Eights…'"],
          ["Copiar post de concorrente", "Especialmente IG do Eneagrama tem MUITO conteúdo raso. Nosso diferencial é depth + citação. Não vire mais um."],
          ["Usar emoji demais", "Um post nosso pode ter 0 emojis. Emoji esconde pouca ideia. Se o post é forte, vai sem."],
          ["Hashtag aleatória/flood", "IG: 15-25. LinkedIn: 3-5. Nunca use #love #instagood genérico."],
          ["Abrir post com 'Olá pessoal...'", "Sem aquecimento. A primeira linha é hook — se não pára rolagem, o post morre."],
          ["Traduzir termos técnicos", "Wing, instinct, fixation, countertype — mantém em inglês, sempre."],
          ["Prometer resultado terapêutico", "'Eneagrama cura trauma' = não. É framework de auto-conhecimento."],
          ["Politizar tipos", "Não ligue tipo a ideologia política. Todos os tipos existem em todos os espectros."],
          ["Gamificar demais ('qual você é?')", "Quiz é Pilar E, ok — mas não faça disso 50% do feed. Diversifica."],
          ["Postar sem conferir o compliance check", "Se tem ⚠️ amarelo, lê antes. Hedging, citação com página, hashtag count."],
          ["Postar EN com erro de digitação em autor", "'Chesnutt', 'Rizo', 'Narenjo' — confere a grafia, sempre."],
          ["Mandar o prompt de imagem pro designer sem contexto", "Sempre manda o prompt + quer linkar ao post. Designer precisa entender o mood."]
        ].map(([title, desc], i) => (
          <div key={i} className="border-l-4 border-destructive/50 pl-3 py-1">
            <div className="font-medium">❌ {title}</div>
            <div className="text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </>
  ),

  faq: (
    <>
      <h3>Perguntas frequentes</h3>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">E se a IA gerar algo que soa estranho ou raso?</summary>
        <p className="mt-2 text-sm">
          Regenera. Ou edita o PT na coluna esquerda, ajusta o tom ("mais introspectivo", "menos dramático")
          e clica 🔄 Atualizar EN no bloco. Se ainda assim ruim, aumenta a <em>profundidade</em> pra <em>scholar</em>
          e tenta de novo.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">Posso rodar o mesmo brief duas vezes?</summary>
        <p className="mt-2 text-sm">
          Sim. A IA não retorna exatamente o mesmo texto. Você pode gerar 2-3 e escolher o melhor.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">Como mudo a imagem depois?</summary>
        <p className="mt-2 text-sm">
          A gente não gera imagem no app — só o prompt. Você pega o prompt no ZIP exportado e cola
          no Nano Banana (ou manda pro designer). Se a primeira imagem não ficou boa, só regera no
          Nano Banana com o mesmo prompt ou ajusta o prompt levemente.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">Posso deletar um post que ficou ruim?</summary>
        <p className="mt-2 text-sm">
          Sim. No editor do post, botão 🗑️ em vermelho. Não recupera depois.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">O que acontece com a citação usada?</summary>
        <p className="mt-2 text-sm">
          Quando você marca o post como <strong>published</strong>, o sistema registra que aquela
          citação foi usada. Ela não aparece em novos posts pelos próximos 60 dias (anti-repetição).
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">Posso postar o mesmo texto no IG e LinkedIn?</summary>
        <p className="mt-2 text-sm">
          Não recomendo. Ideal: gerar 2 posts separados (um com rede=IG, outro com rede=LinkedIn).
          A IA adapta tom, formato e hashtag. Compartilhar idêntico perde força nas duas redes.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">O que é "Compliance Check"?</summary>
        <p className="mt-2 text-sm">
          4 verificações automáticas: (1) tem citação? (2) citação tem página? (3) usa hedging em
          claim sobre pessoa? (4) quantidade de hashtag dentro do limite? Verde = tudo ok. Amarelo
          = checa manualmente.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">Samara pode mexer no /admin/config?</summary>
        <p className="mt-2 text-sm">
          Não. É só pra admin (Lucas). Você não precisa — as chaves de IA já estão configuradas. Se algo
          estiver estranho com geração, fala com o Lucas.
        </p>
      </details>
      <details className="border rounded-lg p-4 my-2">
        <summary className="font-medium cursor-pointer">E se o app estiver fora do ar?</summary>
        <p className="mt-2 text-sm">
          Avisa o Lucas com screenshot. Geralmente é deploy em andamento — reseta em ~5min.
        </p>
      </details>
    </>
  ),

  leituras: (
    <>
      <h3>Recomendações em ordem do mais acessível ao mais profundo</h3>
      <ol className="space-y-3 text-sm">
        <li>
          <strong>Don Richard Riso &amp; Russ Hudson — <em>The Wisdom of the Enneagram</em></strong>{" "}
          <span className="text-muted-foreground">(tem em PT: "A Sabedoria do Eneagrama")</span>
          <div className="ml-4 text-muted-foreground">
            O livro nº 1 pra começar. Linguagem clara, capítulos por tipo, nível de saúde bem
            explicado. Se for ler só um, é esse. ~500 páginas.
          </div>
        </li>
        <li>
          <strong>Don Richard Riso &amp; Russ Hudson — <em>Discovering Your Personality Type</em></strong>
          <div className="ml-4 text-muted-foreground">
            Acompanha um mini-teste e interpretações. Bom complemento prático.
          </div>
        </li>
        <li>
          <strong>Beatrice Chestnut — <em>The Complete Enneagram: 27 Subtypes Revealed</em></strong>
          <div className="ml-4 text-muted-foreground">
            ESSENCIAL pra entender instintos (SP/SX/SO). Sem isso fica no superficial. Em inglês
            só, ~500 páginas.
          </div>
        </li>
        <li>
          <strong>Helen Palmer — <em>The Enneagram in Love and Work</em></strong>{" "}
          <span className="text-muted-foreground">(tem em PT: "O Eneagrama: a Arte de Compreender a Si e aos Outros")</span>
          <div className="ml-4 text-muted-foreground">
            Foco em relacionamentos e workplace. Bom pra criar posts de Pilar C (Type in Context).
          </div>
        </li>
        <li>
          <strong>Sandra Maitri — <em>The Spiritual Dimension of the Enneagram</em></strong>
          <div className="ml-4 text-muted-foreground">
            Quando quiser profundidade espiritual/filosófica. Pra Pilar F avançado ou posts
            contemplativos. Em inglês.
          </div>
        </li>
        <li>
          <strong>Claudio Naranjo — <em>Character and Neurosis</em></strong>{" "}
          <span className="text-muted-foreground">(tem em PT: "27 Personagens em Busca do Ser")</span>
          <div className="ml-4 text-muted-foreground">
            Denso, clínico. Só depois de ter base. Mas é aqui que você vê a arquitetura profunda
            do Eneagrama. É o autor mais citado no acervo por densidade.
          </div>
        </li>
      </ol>
      <h3>Canais no YouTube (só sugestão externa)</h3>
      <ul className="text-sm">
        <li><strong>Enneagram Institute (canal oficial Riso &amp; Hudson)</strong> — inglês, didático</li>
        <li><strong>CP Enneagram</strong> — em português, boa introdução</li>
        <li><strong>The Narrative Enneagram</strong> — painéis de entrevistas reais com cada tipo</li>
      </ul>
      <h3>Ordem sugerida de estudo (8 semanas)</h3>
      <ol className="text-sm">
        <li>Semana 1: leia esse Playbook todo + seção "Tipos" do Riso &amp; Hudson</li>
        <li>Semana 2-4: 1 tipo por 2 dias, lendo o capítulo do Riso+Hudson</li>
        <li>Semana 5: instintos — introdução do livro da Chestnut</li>
        <li>Semana 6: linhas e níveis de saúde (Riso &amp; Hudson)</li>
        <li>Semana 7: comparações entre tipos ambíguos (seção 7 aqui + Chestnut)</li>
        <li>Semana 8: revise, retome posts que criou pra reavaliar</li>
      </ol>
    </>
  ),

  brand: <BrandSection />
};

function BrandSection() {
  return (
    <>
      <p>
        A identidade visual do SmartEnneagram. Use exatamente o que está aqui — não invente
        cores ou fontes. Quando for criar um post no Canva, comece sempre destes 3 elementos:
        logo + paleta + tipografia.
      </p>

      {/* ============== LOGOS ============== */}
      <h3>Logos</h3>
      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Quadrada (favicon) */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <div
            className="aspect-square flex items-center justify-center p-6"
            style={{ background: "linear-gradient(135deg,#3d8b40,#245828)" }}
          >
            <img
              src="/brand/logo-square.svg"
              alt="Logo quadrada SmartEnneagram"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-3 text-xs space-y-2">
            <div className="font-semibold">Logo quadrada</div>
            <div className="text-muted-foreground">
              Pra avatar de Instagram/LinkedIn, ícone, badge.
            </div>
            <div className="flex gap-2">
              <a
                href="/brand/logo-square.svg"
                download
                className="inline-flex items-center px-2 py-1 rounded border text-xs hover:bg-accent"
              >
                ⬇ SVG
              </a>
              <a
                href="/brand/logo-square-512.png"
                download
                className="inline-flex items-center px-2 py-1 rounded border text-xs hover:bg-accent"
              >
                ⬇ PNG 512
              </a>
            </div>
          </div>
        </div>

        {/* Marca (verde com gradient) */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <div className="aspect-square flex items-center justify-center p-6 bg-white">
            <img
              src="/brand/logo.svg"
              alt="Logo SmartEnneagram (verde)"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-3 text-xs space-y-2">
            <div className="font-semibold">Logo principal (verde)</div>
            <div className="text-muted-foreground">
              Pra fundo branco/claro. Carrosséis, headers, post finais.
            </div>
            <div className="flex gap-2">
              <a
                href="/brand/logo.svg"
                download
                className="inline-flex items-center px-2 py-1 rounded border text-xs hover:bg-accent"
              >
                ⬇ SVG
              </a>
              <a
                href="/brand/logo.png"
                download
                className="inline-flex items-center px-2 py-1 rounded border text-xs hover:bg-accent"
              >
                ⬇ PNG
              </a>
            </div>
          </div>
        </div>

        {/* Marca branca (pra fundo escuro) */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <div
            className="aspect-square flex items-center justify-center p-6"
            style={{ background: "#141f14" }}
          >
            <img
              src="/brand/logo-white.svg"
              alt="Logo SmartEnneagram branca"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-3 text-xs space-y-2">
            <div className="font-semibold">Logo branca</div>
            <div className="text-muted-foreground">
              Pra fundo escuro/foto cinematográfica. M1 com gradient overlay, M5 noturno.
            </div>
            <div className="flex gap-2">
              <a
                href="/brand/logo-white.svg"
                download
                className="inline-flex items-center px-2 py-1 rounded border text-xs hover:bg-accent"
              >
                ⬇ SVG
              </a>
            </div>
          </div>
        </div>
      </div>

      <h4 className="font-semibold mt-6 mb-2">⚠️ Regras de uso da logo</h4>
      <ul className="text-sm">
        <li>Mantenha sempre uma <strong>margem mínima</strong> em volta da logo igual à altura da letra "S"</li>
        <li><strong>Nunca</strong> distorça (não estica/encolhe horizontalmente — só escala proporcional)</li>
        <li><strong>Nunca</strong> mude a cor (use a versão branca pra fundo escuro, verde pra fundo claro)</li>
        <li><strong>Nunca</strong> coloque logo verde sobre fundo verde — sem contraste</li>
        <li>Tamanho mínimo: <strong>40px de altura</strong> em telas (legibilidade)</li>
      </ul>

      {/* ============== CORES ============== */}
      <h3>Paleta de cores</h3>
      <p className="text-sm text-muted-foreground">
        Clique em qualquer swatch pra copiar o código hex pro clipboard.
      </p>

      <h4 className="font-semibold mt-4 mb-2">Verdes (assinatura da marca)</h4>
      <div className="not-prose grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
        <ColorSwatch name="Green" hex="#2e7032" desc="Primary — texto/UI" />
        <ColorSwatch name="Green Dark" hex="#245828" desc="Hover, profundidade" />
        <ColorSwatch name="Green Light" hex="#3d8b40" desc="Acento, hover claro" />
        <ColorSwatch
          name="Green Gradient"
          hex="#3d8b40 → #245828"
          desc="Backgrounds dramáticos, badges"
          gradient
        />
      </div>

      <h4 className="font-semibold mt-4 mb-2">Acentos (uso pontual)</h4>
      <div className="not-prose grid grid-cols-3 gap-3 my-3">
        <ColorSwatch name="Teal" hex="#187a62" desc="Info, dados, citação alt" />
        <ColorSwatch name="Rose" hex="#b93020" desc="Alerta, mito (pilar D)" />
        <ColorSwatch name="Amber" hex="#c87800" desc="Atenção, highlight" />
      </div>

      <h4 className="font-semibold mt-4 mb-2">Neutros (textos e fundos)</h4>
      <div className="not-prose grid grid-cols-3 md:grid-cols-6 gap-3 my-3">
        <ColorSwatch name="Void" hex="#f6f8f4" desc="BG mais leve" />
        <ColorSwatch name="Deep" hex="#eef2ea" desc="BG seção" />
        <ColorSwatch name="Raised" hex="#eff4ec" desc="Card sobre void" />
        <ColorSwatch name="Hover" hex="#e5ede0" desc="Hover claro" />
        <ColorSwatch name="Base" hex="#ffffff" desc="Branco puro (M5)" />
        <ColorSwatch name="Txt" hex="#141f14" desc="Texto principal" />
      </div>

      <h4 className="font-semibold mt-6 mb-2">Onde usar cada cor</h4>
      <div className="not-prose text-sm">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 border">Contexto</th>
              <th className="text-left p-2 border">Cor</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Logo + headlines de capa", "Green / Green Dark"],
              ["CTA / botões / link bio", "Green Light"],
              ["Backgrounds dramáticos (M1)", "Green Gradient + foto overlay"],
              ["Texto principal (corpo)", "Txt #141f14 sobre Void/Base"],
              ["Card de citação (M5)", "Base #fff sobre textura paper"],
              ["Pilar D (myth-busting)", "Rose pro mito + Green pro fato"],
              ["Pilar F (dados/big5)", "Teal pra gráficos"],
              ["Highlight pontual", "Amber"]
            ].map(([ctx, cor]) => (
              <tr key={ctx} className="border-t">
                <td className="p-2 border">{ctx}</td>
                <td className="p-2 border font-mono text-xs">{cor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============== TIPOGRAFIA ============== */}
      <h3>Tipografia</h3>
      <p>
        Três fontes (Google Fonts, gratuitas). Baixe e instale no seu Canva/PC pra ter
        consistência total com o site oficial.
      </p>

      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* DM Serif Display */}
        <div className="border rounded-lg p-5 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Headlines / Display
          </div>
          <div
            className="text-4xl mb-2"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Aa Bb Cc
          </div>
          <div
            className="text-2xl italic mb-3"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Reasons you feel empty.
          </div>
          <div className="text-sm font-semibold">DM Serif Display</div>
          <div className="text-xs text-muted-foreground mb-3">Regular + Italic</div>
          <a
            href="https://fonts.google.com/specimen/DM+Serif+Display"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            ⬇ baixar no Google Fonts
          </a>
          <p className="text-xs text-muted-foreground mt-3">
            Use em: M1 headlines, M2 manchete, M5 citação, capa de carrossel, qualquer título grande.
          </p>
        </div>

        {/* DM Sans */}
        <div className="border rounded-lg p-5 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Corpo / UI
          </div>
          <div
            className="text-4xl mb-2"
            style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
          >
            Aa Bb Cc
          </div>
          <div
            className="text-base mb-3 leading-relaxed"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            For Fours, the experience of feeling not-quite-right is a daily companion.
          </div>
          <div className="text-sm font-semibold">DM Sans</div>
          <div className="text-xs text-muted-foreground mb-3">300, 400, 500, 600, 700</div>
          <a
            href="https://fonts.google.com/specimen/DM+Sans"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            ⬇ baixar no Google Fonts
          </a>
          <p className="text-xs text-muted-foreground mt-3">
            Use em: corpo de texto, UI, hashtags, CTAs, alt-text, qualquer parágrafo.
          </p>
        </div>

        {/* JetBrains Mono */}
        <div className="border rounded-lg p-5 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Mono / Atribuição
          </div>
          <div
            className="text-4xl mb-2"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            Aa Bb Cc
          </div>
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: "0.15em" }}
          >
            RISO &amp; HUDSON · 1996 · P.157
          </div>
          <div className="text-sm font-semibold">JetBrains Mono</div>
          <div className="text-xs text-muted-foreground mb-3">400, 500</div>
          <a
            href="https://fonts.google.com/specimen/JetBrains+Mono"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            ⬇ baixar no Google Fonts
          </a>
          <p className="text-xs text-muted-foreground mt-3">
            Use em: atribuição de citação ("AUTOR · OBRA · ANO · PÁG"), labels técnicos, dados em M9.
          </p>
        </div>
      </div>

      <h4 className="font-semibold mt-6 mb-2">Hierarquia tipográfica recomendada</h4>
      <div className="not-prose text-sm">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 border">Nível</th>
              <th className="text-left p-2 border">Fonte</th>
              <th className="text-left p-2 border">Tamanho típico</th>
              <th className="text-left p-2 border">Peso</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Headline grande (capa)", "DM Serif Display", "72-84pt", "Regular"],
              ["Headline citação (M5)", "DM Serif Display Italic", "48-60pt", "Italic"],
              ["Subtítulo", "DM Sans", "24-32pt", "Bold (700)"],
              ["Corpo", "DM Sans", "16-20pt", "Regular (400)"],
              ["Caption pequena", "DM Sans", "14pt", "Medium (500)"],
              ["Atribuição (citação)", "JetBrains Mono", "11-13pt", "Regular CAPS + letter-spacing"]
            ].map((row) => (
              <tr key={row[0]} className="border-t">
                {row.map((c, i) => (
                  <td key={i} className="p-2 border">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============== CORE / TOM VISUAL ============== */}
      <h3>Core visual — o que faz um post parecer "SmartEnneagram"</h3>
      <ul>
        <li>
          <strong>Fotografia cinematográfica</strong>, não estoque genérico. Iluminação natural
          (janela, golden hour), profundidade de campo, pessoa em momento contemplativo.
        </li>
        <li>
          <strong>Paleta dessaturada</strong> com pontos de verde-marca. Evite cores saturadas
          tipo "feed de Instagram-fitness".
        </li>
        <li>
          <strong>Tipografia generosa</strong>. Espaço em branco é design. Não enche o card.
        </li>
        <li>
          <strong>Citação sempre presente.</strong> Se um post não cita, não é nosso.
        </li>
        <li>
          <strong>Atribuição em mono CAPS.</strong> Visualmente diferencia do corpo do texto e
          dá ar acadêmico.
        </li>
      </ul>

      <h4 className="font-semibold mt-4 mb-2">Mood (uma linha)</h4>
      <blockquote>
        <em>
          Uma editora literária com selo psicológico. Kinfolk meets New Yorker meets terapia.
          Densidade sem peso. Autoridade sem rigidez.
        </em>
      </blockquote>

      <h4 className="font-semibold mt-6 mb-2">Inspirações (referências externas)</h4>
      <ul className="text-sm">
        <li>Penguin Classics (livros) — tipografia + textura paper</li>
        <li>The New Yorker — densidade + ilustração</li>
        <li>Kinfolk Magazine — fotografia cinematográfica + neutros</li>
        <li>A24 (filmes) — paleta de cor cinematográfica</li>
        <li>Wong Kar-wai — color grading saudosa, melancólica</li>
      </ul>

      <h4 className="font-semibold mt-6 mb-2">Pasta de assets local pra você</h4>
      <p className="text-sm">
        Todos os arquivos de logo estão em <code>/brand/</code> aqui no app. Os PNGs servem direto
        pro Canva. Os SVGs servem pro designer ou pra Nano Banana se quiser embutir logo na
        composição.
      </p>
      <ul className="text-sm">
        <li>
          <a href="/brand/logo.svg" download className="text-primary hover:underline">
            ⬇ logo.svg
          </a>{" "}
          — versão verde principal (vetor, escala infinita)
        </li>
        <li>
          <a href="/brand/logo-white.svg" download className="text-primary hover:underline">
            ⬇ logo-white.svg
          </a>{" "}
          — versão branca pra fundo escuro
        </li>
        <li>
          <a href="/brand/logo-square.svg" download className="text-primary hover:underline">
            ⬇ logo-square.svg
          </a>{" "}
          — quadrado (avatar IG/LinkedIn)
        </li>
        <li>
          <a href="/brand/logo-square-512.png" download className="text-primary hover:underline">
            ⬇ logo-square-512.png
          </a>{" "}
          — PNG 512×512 pra Canva/perfil de rede
        </li>
        <li>
          <a href="/brand/logo.png" download className="text-primary hover:underline">
            ⬇ logo.png
          </a>{" "}
          — PNG da logo principal
        </li>
      </ul>
    </>
  );
}

function ColorSwatch({
  name,
  hex,
  desc,
  gradient
}: {
  name: string;
  hex: string;
  desc: string;
  gradient?: boolean;
}) {
  const swatchStyle = gradient
    ? { background: "linear-gradient(135deg,#3d8b40,#245828)" }
    : { background: hex.split(" ")[0] };

  function copy() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(hex);
  }

  return (
    <button
      onClick={copy}
      className="text-left border rounded-lg overflow-hidden bg-background hover:border-primary transition-colors"
      title="Clique pra copiar"
    >
      <div className="h-16" style={swatchStyle} />
      <div className="p-3">
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-xs font-mono text-muted-foreground">{hex}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </button>
  );
}
