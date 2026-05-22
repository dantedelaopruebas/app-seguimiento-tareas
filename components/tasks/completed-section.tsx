"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskRow } from "./task-row";
import type { Task } from "@/lib/db/schema";

export function CompletedSection({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border-subtle pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] text-fg-muted hover:text-fg hover:bg-bg-surface transition-colors w-full"
      >
        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-90")} />
        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
        <span>Completadas hoy</span>
        <span className="text-fg-subtle tabular-nums">{tasks.length}</span>
      </button>
      {open && (
        <div className="mt-1 animate-fade-in">
          {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
