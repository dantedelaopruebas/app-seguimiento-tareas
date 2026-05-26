"use client";

import { create } from "zustand";
import type { Task } from "@/lib/db/schema";

type ProjectLite = { id: string; name: string; color: string; icon: string; count: number };

interface DataState {
  tasks: Task[];
  projects: ProjectLite[];
  hydrated: boolean;

  hydrate: (data: { tasks: Task[]; projects: ProjectLite[] }) => void;

  upsertTask: (t: Task) => void;
  removeTask: (id: string) => void;
  setTaskStatus: (id: string, status: Task["status"], completedAt: Date | null) => void;
  addProjectLite: (p: ProjectLite) => void;
  removeProjectLite: (id: string) => void;
  refreshTasks: (tasks: Task[]) => void;
}

export const useData = create<DataState>((set) => ({
  tasks: [],
  projects: [],
  hydrated: false,

  hydrate: ({ tasks, projects }) => set({ tasks, projects, hydrated: true }),

  upsertTask: (t) =>
    set((s) => {
      const i = s.tasks.findIndex((x) => x.id === t.id);
      if (i === -1) return { tasks: [t, ...s.tasks] };
      const next = s.tasks.slice();
      next[i] = t;
      return { tasks: next };
    }),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setTaskStatus: (id, status, completedAt) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status, completedAt, updatedAt: new Date() } : t
      ),
    })),

  addProjectLite: (p) => set((s) => ({ projects: [...s.projects, p] })),
  removeProjectLite: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  refreshTasks: (tasks) => set({ tasks }),
}));
