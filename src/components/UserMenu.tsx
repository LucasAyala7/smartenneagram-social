"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserMenu({ user }: { user: { name: string; role: string } | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Saiu");
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="text-muted-foreground hidden sm:block">
        {user.name} <span className="text-xs">({user.role})</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout} disabled={loading}>
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </div>
  );
}
