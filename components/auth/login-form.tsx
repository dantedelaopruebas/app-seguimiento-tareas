"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-wider text-fg-subtle">Correo</label>
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full bg-bg-subtle border border-border-subtle rounded-md px-3 py-2 text-[14px] outline-none focus:border-accent placeholder:text-fg-subtle"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-wider text-fg-subtle">Contraseña</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-bg-subtle border border-border-subtle rounded-md px-3 py-2 text-[14px] outline-none focus:border-accent placeholder:text-fg-subtle"
        />
      </div>

      {state?.error && (
        <div className="text-[12px] text-priority-urgent bg-priority-urgent/10 border border-priority-urgent/30 rounded-md px-3 py-2">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-md py-2.5 transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-[11px] text-fg-subtle text-center pt-2">
        Esta app es privada · Solo el dueño puede entrar
      </p>
    </form>
  );
}
