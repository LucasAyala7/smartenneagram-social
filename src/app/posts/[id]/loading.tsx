export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-muted rounded" />
          <div className="h-10 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-96 bg-muted rounded-lg" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Carregando editor... (pode levar 10-30s na primeira abertura em dev mode)
      </p>
    </div>
  );
}
