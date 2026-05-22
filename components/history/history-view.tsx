"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  format, isToday, isYesterday, startOfDay, startOfWeek, startOfMonth, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, Search, X } from "lucide-react";
import { TaskRow } from "@/components/tasks/task-row";
import { listCompletedFiltered } from "@/lib/actions/tasks";
import type { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type ProjectLite = { id: string; name: string; color: string };
type Period = "today" | "week" | "month" | "3months" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
  { key: "3months", label: "Últimos 3 meses" },
  { key: "all", label: "Todo" },
];

function periodToRange(p: Period): Date | null {
  const now = new Date();
  switch (p) {
    case "today": return startOfDay(now);
    case "week": return startOfWeek(now, { weekStartsOn: 1 });
    case "month": return startOfMonth(now);
    case "3months": return subMonths(startOfDay(now), 3);
    case "all": return null;
  }
}

export function HistoryView({
  initialTasks,
  projects,
}: {
  initialTasks: Task[];
  projects: ProjectLite[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [period, setPeriod] = useState<Period>("month");
  const [projectId, setProjectId] = useState<string | "all" | "none">("all");
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    start(async () => {
      const r = await listCompletedFiltered({
        from: periodToRange(period),
        projectId: projectId === "all" ? undefined : projectId === "none" ? null : projectId,
        query,
      });
      setTasks(r);
    });
  }, [period, projectId, query]);

  const groups = useMemo(() => {
    const m = new Map<string, Task[]>();
    for (const t of tasks) {
      const d = t.completedAt ? new Date(t.completedAt) : new Date();
      const key = isToday(d)
        ? "Hoy"
        : isYesterday(d)
        ? "Ayer"
        : format(d, "EEEE d 'de' MMMM", { locale: es });
      const arr = m.get(key) ?? [];
      arr.push(t);
      m.set(key, arr);
    }
    return m;
  }, [tasks]);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-[12px] border transition-colors",
                period === p.key
                  ? "border-accent text-fg bg-accent/10"
                  : "border-border-subtle text-fg-muted hover:text-fg hover:border-border"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value as any)}
            className="bg-bg-elevated border border-border-subtle rounded-md px-2.5 py-1.5 text-[12px] outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">Todos los proyectos</option>
            <option value="none">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-md px-2.5 focus-within:border-accent">
            <Search className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en historial..."
              className="flex-1 bg-transparent py-1.5 text-[12px] outline-none placeholder:text-fg-subtle"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="limpiar">
                <X className="w-3.5 h-3.5 text-fg-subtle hover:text-fg" />
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-fg-subtle px-1">
          {pending ? "Cargando..." : `${tasks.length} tareas`}
        </div>
      </div>

      {/* Resultados */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-fg-subtle">
          <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-subtle grid place-items-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[13px]">No hay tareas que coincidan con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([label, items]) => (
            <section key={label}>
              <h3 className="text-[11px] uppercase tracking-wider text-fg-subtle px-2.5 mb-1 capitalize">
                {label}
              </h3>
              <div>
                {items.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
