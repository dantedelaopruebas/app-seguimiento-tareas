"use client";

import { Command } from "cmdk";
import { useEffect, useState, useTransition } from "react";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import {
  Inbox, Calendar, CalendarDays, LayoutGrid, BarChart3, Plus,
  AlertCircle, Folder, Search, CheckCircle2
} from "lucide-react";
import { createTaskFromInput } from "@/lib/actions/tasks";

interface PaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
export const useCommandPalette = create<PaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

export function CommandPalette({ projects }: { projects: { id: string; name: string; color: string }[] }) {
  const { isOpen, close, toggle } = useCommandPalette();
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, toggle, close]);

  function go(path: string) {
    router.push(path);
    close();
    setValue("");
  }

  function createTask() {
    if (!value.trim()) return;
    const v = value;
    setValue("");
    start(async () => { await createTaskFromInput(v); close(); });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start pt-[15vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="w-[560px] max-w-[92vw] bg-bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        <Command label="Comandos" className="">
          <div className="flex items-center gap-2 px-3 border-b border-border-subtle">
            <Search className="w-4 h-4 text-fg-subtle" />
            <Command.Input
              value={value}
              onValueChange={setValue}
              placeholder="Buscar o crear tarea..."
              className="flex-1 bg-transparent py-3 outline-none text-[14px] placeholder:text-fg-subtle"
            />
            {value.trim() && (
              <button onClick={createTask} disabled={pending} className="text-[11px] text-accent flex items-center gap-1">
                <Plus className="w-3 h-3" /> Crear · ↵
              </button>
            )}
          </div>
          <Command.List className="max-h-[360px] overflow-auto p-1.5">
            <Command.Empty className="px-3 py-6 text-center text-[13px] text-fg-subtle">
              Sin resultados. Presiona ↵ para crear tarea.
            </Command.Empty>

            <Command.Group heading="Navegar" className="text-[10px] uppercase tracking-wider text-fg-subtle px-2 pt-2 pb-1">
              <Item icon={Inbox} label="Inbox" onSelect={() => go("/inbox")} />
              <Item icon={Calendar} label="Hoy" onSelect={() => go("/today")} />
              <Item icon={CalendarDays} label="Próximos 7 días" onSelect={() => go("/upcoming")} />
              <Item icon={AlertCircle} label="Vencidas" onSelect={() => go("/overdue")} />
              <Item icon={CheckCircle2} label="Completadas" onSelect={() => go("/completed")} />
              <Item icon={LayoutGrid} label="Tablero" onSelect={() => go("/board")} />
              <Item icon={CalendarDays} label="Calendario" onSelect={() => go("/calendar")} />
              <Item icon={BarChart3} label="Dashboard" onSelect={() => go("/dashboard")} />
            </Command.Group>

            {projects.length > 0 && (
              <Command.Group heading="Proyectos" className="text-[10px] uppercase tracking-wider text-fg-subtle px-2 pt-3 pb-1">
                {projects.map((p) => (
                  <Item key={p.id} dotColor={p.color} label={p.name} onSelect={() => go(`/project/${p.id}`)} />
                ))}
              </Command.Group>
            )}

            {value.trim() && (
              <Command.Group heading="Acción" className="text-[10px] uppercase tracking-wider text-fg-subtle px-2 pt-3 pb-1">
                <Item icon={Plus} label={`Crear tarea: "${value}"`} onSelect={createTask} />
              </Command.Group>
            )}
          </Command.List>
        </Command>
        <div className="px-3 py-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-fg-subtle">
          <span>↑↓ navegar · ↵ seleccionar</span>
          <span>esc cerrar</span>
        </div>
      </div>
    </div>
  );
}

function Item({ icon: Icon, label, onSelect, dotColor }: { icon?: any; label: string; onSelect: () => void; dotColor?: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-fg-muted cursor-pointer data-[selected=true]:bg-bg-elevated data-[selected=true]:text-fg"
    >
      {dotColor && <span className="dot" style={{ background: dotColor }} />}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </Command.Item>
  );
}
