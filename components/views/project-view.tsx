"use client";

import { useMemo } from "react";
import { startOfDay } from "date-fns";
import { useData } from "@/components/data/store";
import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { TaskList } from "@/components/tasks/task-list";
import { CompletedSection } from "@/components/tasks/completed-section";

export function ProjectView({ id }: { id: string }) {
  const project = useData((s) => s.projects.find((p) => p.id === id));
  const tasks = useData((s) => s.tasks);

  const { pending, completedToday } = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const ofProject = tasks.filter((t) => t.projectId === id);
    return {
      pending: ofProject.filter((t) => t.status !== "done"),
      completedToday: ofProject
        .filter((t) => t.status === "done" && t.completedAt && new Date(t.completedAt) >= todayStart)
        .sort((a, b) => (new Date(b.completedAt!).getTime()) - (new Date(a.completedAt!).getTime())),
    };
  }, [tasks, id]);

  if (!project) {
    return (
      <>
        <Topbar title="Proyecto" />
        <div className="flex-1 grid place-items-center text-[13px] text-fg-subtle">
          Proyecto no encontrado.
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={project.name}
        subtitle={`${pending.length} pendientes${completedToday.length ? ` · ${completedToday.length} hechas hoy` : ""}`}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="dot" style={{ background: project.color }} />
            <span className="text-[12px] text-fg-subtle uppercase tracking-wider">Proyecto</span>
          </div>
          <QuickAdd defaultProjectId={id} />
          <TaskList tasks={pending} emptyMessage="Sin tareas en este proyecto." />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
