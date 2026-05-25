"use client";

import { useMemo } from "react";
import { useData } from "@/components/data/store";
import { Topbar } from "@/components/topbar";
import { Kanban } from "@/components/board/kanban";

export function BoardView() {
  const tasks = useData((s) => s.tasks);
  // Para el tablero queremos pendientes + completadas (todas las últimas 30 días).
  const list = useMemo(() => tasks, [tasks]);
  return (
    <>
      <Topbar title="Tablero" subtitle="Arrastra entre columnas" />
      <div className="flex-1 overflow-hidden p-5">
        <Kanban tasks={list} />
      </div>
    </>
  );
}
