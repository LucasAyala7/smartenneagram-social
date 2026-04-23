import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold mb-3">
            SE
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SmartEnneagram</h1>
          <p className="text-sm text-muted-foreground">Social Factory</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
