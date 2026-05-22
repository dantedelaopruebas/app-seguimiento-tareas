"use client";

import { Plus, HelpCircle } from "lucide-react";
import { useState, useTransition, useRef, useEffect } from "react";
import { createTaskFromInput } from "@/lib/actions/tasks";
import { parseQuickAdd } from "@/lib/parser/quick-add";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function QuickAdd({
  defaultProjectId,
  defaultDueDate,
}: {
  defaultProjectId?: string | null;
  /** Si el usuario crea desde una vista contextual (Hoy, etc.), heredamos su fecha
   * salvo que él escriba una explícitamente. */
  defaultDueDate?: "today" | "tomorrow" | null;
}) {
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "c") { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const preview = value.trim() ? parseQuickAdd(value) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    let v = value;
    // Si la vista define una fecha por defecto y el texto NO menciona una fecha,
    // la añadimos de forma transparente para el usuario.
    if (defaultDueDate && !/\b(hoy|ma(ñ|n)ana|pasado|lunes|martes|mi(é|e)rcoles|jueves|viernes|s(á|a)bado|domingo|\d{1,2}[\/\-]\d{1,2})\b/i.test(v)) {
      v = `${v} ${defaultDueDate === "today" ? "hoy" : "mañana"}`;
    }
    setValue("");
    start(async () => { await createTaskFromInput(v, defaultProjectId); });
  }

  return (
    <form
      onSubmit={submit}
      className="group border border-border-subtle hover:border-border focus-within:border-accent/60 bg-bg-subtle rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Plus className="w-4 h-4 text-fg-subtle group-focus-within:text-accent transition-colors" />
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
          placeholder="¿Qué necesitas hacer?"
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-fg-subtle"
        />
        <button
          type="button"
          tabIndex={-1}
          title="Atajos: escribe 'mañana', '6pm', '!alta', '#etiqueta', '@proyecto' para asignar al vuelo"
          className="text-fg-subtle hover:text-fg-muted transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
        <span className="kbd hidden group-focus-within:inline">↵</span>
      </div>
      {preview && (preview.priority !== "none" || preview.dueDate || preview.tags.length || preview.projectName) && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border-subtle text-[11px] text-fg-muted">
          {preview.priority !== "none" && <Chip label={`!${preview.priority}`} />}
          {preview.dueDate && <Chip label={format(preview.dueDate, "d MMM HH:mm", { locale: es })} />}
          {preview.projectName && <Chip label={`@${preview.projectName}`} />}
          {preview.tags.map((t) => <Chip key={t} label={`#${t}`} />)}
        </div>
      )}
    </form>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle">{label}</span>
  );
}
