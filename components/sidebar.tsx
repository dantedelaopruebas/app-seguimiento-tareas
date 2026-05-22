"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox, Calendar, LayoutGrid, BarChart3, CalendarDays,
  Plus, Folder, ChevronRight, AlertCircle, Sparkles, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { createProject } from "@/lib/actions/projects";

type ProjectLite = { id: string; name: string; color: string; count: number };

export function Sidebar({ projects }: { projects: ProjectLite[] }) {
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setAdding(false); return; }
    start(async () => {
      await createProject(name.trim());
      setName("");
      setAdding(false);
    });
  }

  const linkCls = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors group",
      active ? "bg-bg-elevated text-fg" : "text-fg-muted hover:text-fg hover:bg-bg-surface"
    );

  return (
    <aside className="w-[240px] shrink-0 h-screen border-r border-border-subtle bg-bg-subtle flex flex-col">
      <div className="px-4 h-12 flex items-center gap-2 border-b border-border-subtle">
        <div className="w-6 h-6 rounded-md bg-accent/20 grid place-items-center">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Tareas</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <SidebarItem href="/inbox" icon={Inbox} label="Inbox" active={pathname === "/inbox" || pathname === "/"} />
        <SidebarItem href="/today" icon={Calendar} label="Hoy" active={pathname === "/today"} />
        <SidebarItem href="/upcoming" icon={CalendarDays} label="Próximos 7 días" active={pathname === "/upcoming"} />
        <SidebarItem href="/overdue" icon={AlertCircle} label="Vencidas" active={pathname === "/overdue"} />
        <SidebarItem href="/completed" icon={CheckCircle2} label="Completadas" active={pathname === "/completed"} />

        <div className="h-px bg-border-subtle my-3 mx-1" />

        <SidebarItem href="/board" icon={LayoutGrid} label="Tablero" active={pathname === "/board"} />
        <SidebarItem href="/calendar" icon={CalendarDays} label="Calendario" active={pathname === "/calendar"} />
        <SidebarItem href="/dashboard" icon={BarChart3} label="Dashboard" active={pathname === "/dashboard"} />

        <div className="flex items-center justify-between px-2 mt-5 mb-1.5">
          <span className="text-[11px] uppercase tracking-wider text-fg-subtle">Proyectos</span>
          <button
            onClick={() => setAdding(true)}
            className="p-0.5 rounded hover:bg-bg-surface text-fg-subtle hover:text-fg transition-colors"
            aria-label="Nuevo proyecto"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {adding && (
          <form onSubmit={submit} className="px-1 mb-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => { if (e.key === "Escape") { setAdding(false); setName(""); } }}
              placeholder="Nombre del proyecto"
              disabled={pending}
              className="w-full bg-bg-elevated border border-border rounded-md px-2.5 py-1.5 text-[13px] outline-none focus:border-accent placeholder:text-fg-subtle"
            />
          </form>
        )}

        {projects.map((p) => {
          const href = `/project/${p.id}`;
          const active = pathname === href;
          return (
            <Link key={p.id} href={href} className={linkCls(active)}>
              <span className="dot" style={{ background: p.color }} />
              <span className="flex-1 truncate">{p.name}</span>
              {p.count > 0 && (
                <span className="text-[11px] text-fg-subtle tabular-nums">{p.count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border-subtle text-[11px] text-fg-subtle flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="dot" style={{ background: "#3ecf8e" }} />
          Supabase · Nube
        </span>
        <span className="kbd">⌘K</span>
      </div>
    </aside>
  );
}

function SidebarItem({
  href, icon: Icon, label, active,
}: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
        active ? "bg-bg-elevated text-fg" : "text-fg-muted hover:text-fg hover:bg-bg-surface"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}
