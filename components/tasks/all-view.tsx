"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  isToday, isTomorrow, isYesterday, isThisWeek, addDays, isBefore, startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { TaskRow } from "@/components/tasks/task-row";
import type { Task } from "@/lib/db/schema";

type Filter = "all" | "today" | "tomorrow" | "this_week" | "upcoming" | "no_date" | "overdue";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "today", label: "Hoy" },
  { key: "tomorrow", label: "Mañana" },
  { key: "this_week", label: "Esta semana" },
  { key: "upcoming", label: "Próximas" },
  { key: "no_date", label: "Sin fecha" },
  { key: "overdue", label: "Atrasadas" },
];

export function AllView({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const inAWeek = addDays(today, 7);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false;
      const due = t.dueDate ? new Date(t.dueDate) : null;
      switch (filter) {
        case "all":
          return true;
        case "today":
          return due && isToday(due);
        case "tomorrow":
          return due && isTomorrow(due);
        case "this_week":
          return due && isThisWeek(due, { weekStartsOn: 1 });
        case "upcoming":
          return due && due >= tomorrow;
        case "no_date":
          return !due;
        case "overdue":
          return due && isBefore(due, today);
      }
    });
  }, [tasks, filter, query, today, tomorrow]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0, today: 0, tomorrow: 0, this_week: 0, upcoming: 0, no_date: 0, overdue: 0,
    };
    for (const t of tasks) {
      c.all++;
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (!due) c.no_date++;
      else {
        if (isToday(due)) c.today++;
        if (isTomorrow(due)) c.tomorrow++;
        if (isThisWeek(due, { weekStartsOn: 1 })) c.this_week++;
        if (due >= tomorrow) c.upcoming++;
        if (isBefore(due, today)) c.overdue++;
      }
    }
    return c;
  }, [tasks, today, tomorrow]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] border transition-colors",
                filter === f.key
                  ? "border-accent text-fg bg-accent/10"
                  : "border-border-subtle text-fg-muted hover:text-fg hover:border-border"
              )}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={cn(
                  "text-[10px] tabular-nums",
                  filter === f.key ? "text-accent" : "text-fg-subtle"
                )}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-md px-2.5 focus-within:border-accent">
          <Search className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en tus tareas..."
            className="flex-1 bg-transparent py-1.5 text-[12px] outline-none placeholder:text-fg-subtle"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="limpiar">
              <X className="w-3.5 h-3.5 text-fg-subtle hover:text-fg" />
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[13px] text-fg-subtle">
          {query
            ? "Sin coincidencias."
            : filter === "all"
            ? "No tienes tareas pendientes. ¡Bien hecho!"
            : "Nada para este filtro."}
        </div>
      ) : (
        <div>{filtered.map((t) => <TaskRow key={t.id} task={t} />)}</div>
      )}
    </div>
  );
}
