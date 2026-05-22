"use client";

import { useState, useTransition } from "react";
import { Check, Calendar, Trash2, GripVertical } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toggleTask, deleteTask, updateTask } from "@/lib/actions/tasks";
import type { Task } from "@/lib/db/schema";
import { useToast } from "@/components/toast";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-priority-urgent",
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
  none: "",
};

export function TaskRow({ task }: { task: Task }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);
  const done = optimisticDone ?? task.status === "done";
  const showToast = useToast((s) => s.show);

  function commitTitle() {
    setEditing(false);
    if (title.trim() && title !== task.title) {
      start(async () => { await updateTask(task.id, { title: title.trim() }); });
    } else {
      setTitle(task.title);
    }
  }

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && !isToday(due) && !done;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md transition-colors border border-transparent",
        "hover:bg-bg-surface hover:border-border-subtle",
        done && "opacity-50"
      )}
    >
      <button
        aria-label="completar"
        onClick={() => {
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
        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      {task.priority !== "none" && (
        <span
          className={cn("w-[3px] h-4 rounded-full shrink-0", PRIORITY_COLORS[task.priority])}
          title={`Prioridad: ${task.priority}`}
        />
      )}

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") { setTitle(task.title); setEditing(false); }
            }}
            className="w-full bg-transparent outline-none text-[13.5px]"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={cn("text-left text-[13.5px] truncate w-full", done && "line-through")}
          >
            {task.title}
          </button>
        )}
      </div>

      {due && (
        <span className={cn(
          "flex items-center gap-1 text-[11px] tabular-nums shrink-0",
          overdue ? "text-priority-urgent" : isToday(due) ? "text-priority-high" : "text-fg-muted"
        )}>
          <Calendar className="w-3 h-3" />
          {isToday(due) ? "hoy" : isTomorrow(due) ? "mañana" : format(due, "d MMM", { locale: es })}
        </span>
      )}

      <button
        onClick={() => start(async () => { await deleteTask(task.id); })}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-bg-elevated text-fg-subtle hover:text-priority-urgent transition-all"
        aria-label="eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
