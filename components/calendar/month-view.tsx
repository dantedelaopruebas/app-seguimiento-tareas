"use client";

import { useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db/schema";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-priority-urgent", high: "bg-priority-high",
  medium: "bg-priority-medium", low: "bg-priority-low", none: "bg-fg-subtle",
};

export function MonthView({ tasks }: { tasks: Task[] }) {
  const [cursor, setCursor] = useState(new Date());
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  });

  const tasksByDay = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const key = format(new Date(t.dueDate), "yyyy-MM-dd");
    const arr = tasksByDay.get(key) ?? [];
    arr.push(t);
    tasksByDay.set(key, arr);
  }

  const weekdays = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-medium capitalize">
          {format(cursor, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(subMonths(cursor, 1))} className="p-1.5 rounded-md hover:bg-bg-surface text-fg-muted hover:text-fg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCursor(new Date())} className="px-2.5 py-1 text-[12px] rounded-md hover:bg-bg-surface text-fg-muted hover:text-fg">
            Hoy
          </button>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="p-1.5 rounded-md hover:bg-bg-surface text-fg-muted hover:text-fg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-border-subtle rounded-lg overflow-hidden flex-1">
        {weekdays.map((d) => (
          <div key={d} className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-fg-subtle border-r border-b border-border-subtle bg-bg-subtle">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <div
              key={key}
              className={cn(
                "border-r border-b border-border-subtle p-1.5 min-h-[100px] flex flex-col gap-1",
                !inMonth && "bg-bg-subtle/30",
              )}
            >
              <span className={cn(
                "text-[11px] tabular-nums w-5 h-5 grid place-items-center rounded-full",
                today ? "bg-accent text-white" : inMonth ? "text-fg-muted" : "text-fg-disabled"
              )}>
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 px-1 py-0.5 rounded bg-bg-surface text-[11px] truncate">
                    <span className={cn("w-1 h-1 rounded-full shrink-0", PRIORITY_COLORS[t.priority])} />
                    <span className={cn("truncate", t.status === "done" && "line-through text-fg-subtle")}>{t.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-fg-subtle px-1">+{dayTasks.length - 3} más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
