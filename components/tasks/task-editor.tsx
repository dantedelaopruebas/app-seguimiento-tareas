"use client";

import { useEffect, useState, useTransition } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  X, Calendar as CalIcon, Flag, Folder, Trash2,
  Sun, ArrowRight, CalendarPlus, CalendarX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskEditor } from "./task-editor-store";
import { updateTask, deleteTask } from "@/lib/actions/tasks";
import { useToast } from "@/components/toast";

type ProjectLite = { id: string; name: string; color: string };

const PRIORITIES: { value: "none" | "low" | "medium" | "high" | "urgent"; label: string; color: string }[] = [
  { value: "none", label: "Sin", color: "bg-fg-disabled" },
  { value: "low", label: "Baja", color: "bg-priority-low" },
  { value: "medium", label: "Media", color: "bg-priority-medium" },
  { value: "high", label: "Alta", color: "bg-priority-high" },
  { value: "urgent", label: "Urgente", color: "bg-priority-urgent" },
];

export function TaskEditor({ projects }: { projects: ProjectLite[] }) {
  const { task, close, patch } = useTaskEditor();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showToast = useToast((s) => s.show);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setConfirmDelete(false);
    }
  }, [task?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    if (task) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, close]);

  if (!task) return null;

  function commitTitle() {
    if (!task) return;
    const v = title.trim();
    if (!v || v === task.title) return;
    patch({ title: v });
    start(async () => { await updateTask(task.id, { title: v }); });
  }

  function commitDescription() {
    if (!task) return;
    const v = description.trim() || null;
    if (v === (task.description ?? null)) return;
    patch({ description: v });
    start(async () => { await updateTask(task.id, { description: v }); });
  }

  function setDate(d: Date | null) {
    if (!task) return;
    patch({ dueDate: d });
    start(async () => { await updateTask(task.id, { dueDate: d }); });
  }

  function setPriority(p: typeof PRIORITIES[number]["value"]) {
    if (!task) return;
    patch({ priority: p });
    start(async () => { await updateTask(task.id, { priority: p }); });
  }

  function setProject(id: string | null) {
    if (!task) return;
    patch({ projectId: id });
    start(async () => { await updateTask(task.id, { projectId: id }); });
  }

  function doDelete() {
    if (!task) return;
    const id = task.id;
    const titleSnapshot = task.title;
    close();
    start(async () => {
      await deleteTask(id);
      showToast(`Eliminada: ${titleSnapshot}`);
    });
  }

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const today = startOfDay(new Date());

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
      />
      {/* Side sheet */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-[440px] max-w-[92vw] bg-bg-surface border-l border-border-subtle shadow-2xl flex flex-col animate-slide-up">
        <header className="h-12 px-4 flex items-center justify-between border-b border-border-subtle shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-fg-subtle">Editar tarea</span>
          <button
            onClick={close}
            className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors"
            aria-label="cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Título */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            placeholder="Título de la tarea"
            className="w-full bg-transparent outline-none text-[18px] font-medium placeholder:text-fg-subtle"
          />

          {/* Descripción */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            placeholder="Añadir notas..."
            rows={3}
            className="w-full bg-transparent outline-none text-[13px] text-fg-muted placeholder:text-fg-subtle resize-none"
          />

          {/* Fecha */}
          <section>
            <label className="flex items-center gap-2 text-[12px] text-fg-subtle mb-2">
              <CalIcon className="w-3.5 h-3.5" /> Fecha
            </label>
            <div className="flex flex-wrap gap-1.5">
              <DateChip icon={Sun} label="Hoy" active={due && sameDay(due, today)} onClick={() => setDate(today)} />
              <DateChip icon={ArrowRight} label="Mañana" active={due && sameDay(due, addDays(today, 1))} onClick={() => setDate(addDays(today, 1))} />
              <DateChip icon={CalendarPlus} label="Próx. semana" active={false} onClick={() => setDate(addDays(today, 7))} />
              <DateChip icon={CalendarX} label="Sin fecha" active={!due} onClick={() => setDate(null)} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={due ? format(due, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) { setDate(null); return; }
                  const [y, m, d] = v.split("-").map(Number);
                  setDate(new Date(y, m - 1, d));
                }}
                className="flex-1 bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-accent [color-scheme:dark]"
              />
              {due && (
                <span className="text-[11px] text-fg-muted">
                  {format(due, "EEE d MMM", { locale: es })}
                </span>
              )}
            </div>
          </section>

          {/* Prioridad */}
          <section>
            <label className="flex items-center gap-2 text-[12px] text-fg-subtle mb-2">
              <Flag className="w-3.5 h-3.5" /> Prioridad
            </label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] border transition-colors",
                    task.priority === p.value
                      ? "border-accent text-fg bg-accent/10"
                      : "border-border-subtle text-fg-muted hover:text-fg hover:border-border"
                  )}
                >
                  <span className={cn("w-1.5 h-3 rounded-full", p.color)} />
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Proyecto */}
          <section>
            <label className="flex items-center gap-2 text-[12px] text-fg-subtle mb-2">
              <Folder className="w-3.5 h-3.5" /> Proyecto
            </label>
            <select
              value={task.projectId ?? ""}
              onChange={(e) => setProject(e.target.value || null)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-1.5 text-[13px] outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </section>

          <div className="text-[10px] text-fg-subtle font-mono pt-2">
            Creada {format(new Date(task.createdAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
          </div>
        </div>

        {/* Footer: eliminar */}
        <footer className="px-5 py-3 border-t border-border-subtle shrink-0">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-fg-muted">¿Eliminar esta tarea?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[12px] text-fg-muted hover:text-fg rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={doDelete}
                  disabled={pending}
                  className="px-3 py-1.5 text-[12px] text-white bg-priority-urgent hover:opacity-90 rounded-md transition-opacity"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-fg-muted hover:text-priority-urgent transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar tarea
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}

function DateChip({
  icon: Icon, label, active, onClick,
}: {
  icon: any; label: string; active: boolean | null; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] border transition-colors",
        active
          ? "border-accent text-fg bg-accent/10"
          : "border-border-subtle text-fg-muted hover:text-fg hover:border-border"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
