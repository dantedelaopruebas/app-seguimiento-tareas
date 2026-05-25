"use client";

import { useMemo } from "react";
import { endOfDay, startOfDay, isToday } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useData } from "@/components/data/store";
import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";

export function TodayView() {
  const tasks = useData((s) => s.tasks);
  const { pending, completedToday } = useMemo(() => {
    const now = new Date();
    const todayEnd = endOfDay(now);
    const todayStart = startOfDay(now);
    const pending = tasks
      .filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) <= todayEnd)
      .sort((a, b) => (new Date(a.dueDate!).getTime()) - (new Date(b.dueDate!).getTime()));
    const completedToday = tasks
      .filter((t) => t.status === "done" && t.completedAt && new Date(t.completedAt) >= todayStart)
      .sort((a, b) => (new Date(b.completedAt!).getTime()) - (new Date(a.completedAt!).getTime()));
    return { pending, completedToday };
  }, [tasks]);

  return (
    <>
      <Topbar
        title="Hoy"
        subtitle={`${format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}${completedToday.length ? ` · ${completedToday.length} hechas` : ""}`}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <QuickAdd defaultDueDate="today" />
          <TaskList tasks={pending} emptyMessage="No hay nada pendiente para hoy. 🌿" />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
