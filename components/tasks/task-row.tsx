"use client";

import { useState, useTransition } from "react";
import { Check, Calendar } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toggleTask } from "@/lib/actions/tasks";
import type { Task } from "@/lib/db/schema";
import { useToast } from "@/components/toast";
import { useTaskEditor } from "./task-editor-store";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-priority-urgent",
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
  none: "",
};

export function TaskRow({ task }: { task: Task }) {
  const [pending, start] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);
  const done = optimisticDone ?? task.status === "done";
  const showToast = useToast((s) => s.show);
  const openEditor = useTaskEditor((s) => s.open);

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && !isToday(due) && !done;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md transition-colors border border-transparent cursor-pointer",
        "hover:bg-bg-surface hover:border-border-subtle",
        done && "opacity-50"
      )}
      onClick={() => openEditor(task)}
    >
      <button
        aria-label="completar"
        onClick={(e) => {
          e.stopPropagation();
          const willBeDone = !done;
          setOptimisticDone(willBeDone);
          if (willBeDone) showToast(`Completada: ${task.title}`);
          start(async () => {
            await toggleTask(task.id);
            setOptimisticDone(null);
          });
        }}
        disabled={pending}
        className={cn(
          "shrink-0 w-[18px] h-[18px] rounded-full border transition-all grid place-items-center",
          done
            ? "bg-accent border-accent"
            : "border-border-strong hover:border-accent hover:bg-accent/10"
        )}
      >
        {done && <Check className="w-3 h-3 text-white animate-check-pop" strokeWidth={3} />}
      </button>

      {task.priority !== "none" && (
        <span
          className={cn("w-[3px] h-4 rounded-full shrink-0", PRIORITY_COLORS[task.priority])}
          title={`Prioridad: ${task.priority}`}
        />
      )}

      <div className="flex-1 min-w-0">
        <span className={cn("text-[13.5px] truncate block", done && "line-through")}>
          {task.title}
        </span>
      </div>

      {due && (
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] tabular-nums shrink-0",
            overdue ? "text-priority-urgent" : isToday(due) ? "text-priority-high" : "text-fg-muted"
          )}
        >
          <Calendar className="w-3 h-3" />
          {isToday(due)
            ? "hoy"
            : isTomorrow(due)
            ? "mañana"
            : format(due, "d MMM", { locale: es })}
        </span>
      )}
    </div>
  );
}
