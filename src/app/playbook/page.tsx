import { PlaybookContent } from "./PlaybookContent";

export const dynamic = "force-dynamic";

export default function PlaybookPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">📖 Playbook — Eneagrama para a Samara</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Guia completo em português. Cada seção tem um checkbox — marque conforme for lendo.
          O progresso fica salvo no seu navegador (privado, só seu).
        </p>
      </header>
      <PlaybookContent />
    </div>
  );
}
