"use client";

import { create } from "zustand";
import type { Task } from "@/lib/db/schema";

interface EditorState {
  task: Task | null;
  open: (task: Task) => void;
  close: () => void;
  /** Reemplaza la tarea actual (útil tras una actualización). */
  patch: (updates: Partial<Task>) => void;
}

export const useTaskEditor = create<EditorState>((set) => ({
  task: null,
  open: (task) => set({ task }),
  close: () => set({ task: null }),
  patch: (updates) =>
    set((s) => (s.task ? { task: { ...s.task, ...updates } } : s)),
}));
