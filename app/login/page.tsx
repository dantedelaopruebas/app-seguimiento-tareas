import { LoginForm } from "@/components/auth/login-form";
import { Sparkles } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen bg-bg grid place-items-center px-6">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight">Tareas</h1>
            <p className="text-[12px] text-fg-muted mt-1">Inicia sesión para continuar</p>
          </div>
        </div>
        <LoginForm next={sp.next ?? "/today"} />
      </div>
    </main>
  );
}
