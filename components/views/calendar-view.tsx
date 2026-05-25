"use client";

import { useMemo } from "react";
import { useData } from "@/components/data/store";
import { Topbar } from "@/components/topbar";
import { MonthView } from "@/components/calendar/month-view";

export function CalendarView() {
  const tasks = useData((s) => s.tasks);
  const withDates = useMemo(() => tasks.filter((t) => t.dueDate), [tasks]);
  return (
    <>
      <Topbar title="Calendario" subtitle={`${withDates.length} con fecha`} />
      <div className="flex-1 overflow-auto p-5">
        <MonthView tasks={withDates} />
      </div>
    </>
  );
}
