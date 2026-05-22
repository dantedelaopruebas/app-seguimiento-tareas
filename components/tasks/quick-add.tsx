"use client";

import { Plus } from "lucide-react";
import { useState, useTransition, useRef, useEffect } from "react";
import { createTaskFromInput } from "@/lib/actions/tasks";
import { parseQuickAdd } from "@/lib/parser/quick-add";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function QuickAdd({ defaultProjectId }: { defaultProjectId?: string | null }) {
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
    const v = value;
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
          placeholder="Añadir tarea... usa !alta  #tag  @proyecto  mañana  6pm"
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-fg-subtle"
        />
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
