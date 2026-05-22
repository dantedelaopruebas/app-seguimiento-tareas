"use client";

import { Download } from "lucide-react";
import { useTransition } from "react";
import { exportAllAsJson } from "@/lib/actions/stats";

export function ExportButton() {
  const [pending, start] = useTransition();
  function onClick() {
    start(async () => {
      const json = await exportAllAsJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tareas-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex items-center gap-2 text-[12px] text-fg-muted hover:text-fg bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Exportar JSON
    </button>
  );
}
