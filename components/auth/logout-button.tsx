"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton({ email }: { email?: string | null }) {
  const [pending, start] = useTransition();
  return (
    <form action={() => start(async () => { await logoutAction(); })}>
      <button
        type="submit"
        disabled={pending}
        title={email ?? "Cerrar sesión"}
        className="flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-fg-subtle hover:text-fg hover:bg-bg-surface transition-colors"
      >
        <LogOut className="w-3 h-3" />
        Salir
      </button>
    </form>
  );
}
