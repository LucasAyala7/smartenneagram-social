import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SmartEnneagram — Social Factory",
  description: "Gerador de posts para redes sociais do SmartEnneagram (EN + PT)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <header className="border-b bg-card sticky top-0 z-40">
          <div className="container flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                SE
              </span>
              <span className="font-semibold">SmartEnneagram · Social Factory</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                Posts
              </Link>
              <Link
                href="/new"
                className="px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                Novo
              </Link>
              <Link
                href="/admin/config"
                className="px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                Config
              </Link>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
