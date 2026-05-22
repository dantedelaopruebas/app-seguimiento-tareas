"use client";

import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import { useState, useTransition } from "react";
import { moveTaskStatus } from "@/lib/actions/tasks";
import type { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

type Status = "todo" | "in_progress" | "done";
const COLUMNS: { id: Status; title: string; hint: string }[] = [
  { id: "todo", title: "Por hacer", hint: "Pendientes" },
  { id: "in_progress", title: "En progreso", hint: "Activas" },
  { id: "done", title: "Hecho", hint: "Completadas" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-priority-urgent", high: "bg-priority-high",
  medium: "bg-priority-medium", low: "bg-priority-low", none: "",
};

export function Kanban({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as Status;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    start(async () => { await moveTaskStatus(task.id, newStatus, 0); });
  }

  const active = tasks.find((t) => t.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {COLUMNS.map((col) => (
          <Column key={col.id} {...col} tasks={tasks.filter((t) => t.status === col.id)} />
        ))}
      </div>
      <DragOverlay>{active && <Card task={active} dragging />}</DragOverlay>
    </DndContext>
  );
}

function Column({ id, title, hint, tasks }: { id: Status; title: string; hint: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex flex-col bg-bg-subtle border border-border-subtle rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">{title}</span>
          <span className="text-[11px] text-fg-subtle tabular-nums">{tasks.length}</span>
        </div>
        <span className="text-[10px] text-fg-subtle uppercase tracking-wider">{hint}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 overflow-auto transition-colors",
          isOver && "bg-accent/5"
        )}
      >
        {tasks.map((t) => <Card key={t.id} task={t} />)}
        {tasks.length === 0 && (
          <div className="text-center text-[12px] text-fg-subtle py-8">Vacío</div>
        )}
      </div>
    </div>
  );
}

function Card({ task, dragging }: { task: Task; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && !isToday(due) && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-bg-surface border border-border-subtle rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-border transition-colors",
        (isDragging || dragging) && "opacity-50 ring-1 ring-accent"
      )}
    >
      <div className="flex items-start gap-2">
        {task.priority !== "none" && (
          <span className={cn("w-1 h-4 rounded-full mt-0.5 shrink-0", PRIORITY_COLORS[task.priority])} />
        )}
        <p className="text-[13px] leading-snug flex-1">{task.title}</p>
      </div>
      {due && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-[11px] tabular-nums",
          overdue ? "text-priority-urgent" : isToday(due) ? "text-priority-high" : "text-fg-subtle"
        )}>
          <Calendar className="w-3 h-3" />
          {format(due, "d MMM", { locale: es })}
        </div>
      )}
    </div>
  );
}
