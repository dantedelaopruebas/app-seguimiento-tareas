"use client";

import { useMemo } from "react";
import { startOfDay } from "date-fns";
import { useData } from "@/components/data/store";
import { Topbar } from "@/components/topbar";
import { QuickAdd } from "@/components/tasks/quick-add";
import { AllView } from "@/components/tasks/all-view";
import { CompletedSection } from "@/components/tasks/completed-section";

export function AllPageView() {
  const tasks = useData((s) => s.tasks);
  const { pending, completedToday } = useMemo(() => {
    const todayStart = startOfDay(new Date());
    return {
      pending: tasks.filter((t) => t.status !== "done"),
      completedToday: tasks
        .filter((t) => t.status === "done" && t.completedAt && new Date(t.completedAt) >= todayStart)
        .sort((a, b) => (new Date(b.completedAt!).getTime()) - (new Date(a.completedAt!).getTime())),
    };
  }, [tasks]);

  return (
    <>
      <Topbar
        title="Todas"
        subtitle={`${pending.length} pendientes${completedToday.length ? ` · ${completedToday.length} hechas hoy` : ""}`}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          <QuickAdd />
          <AllView tasks={pending} />
          <CompletedSection tasks={completedToday} />
        </div>
      </div>
    </>
  );
}
