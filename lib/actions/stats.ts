"use server";

import { db } from "@/lib/db/client";
import { tasks, projects } from "@/lib/db/schema";
import { startOfDay, subDays, format } from "date-fns";
import { es } from "date-fns/locale";

export async function getDashboardStats() {
  const allTasks = db.select().from(tasks).all();
  const allProjects = db.select().from(projects).all();

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);

  let done = 0;
  let overdue = 0;
  let todayDue = 0;
  for (const t of allTasks) {
    if (t.status === "done") { done++; continue; }
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d < todayStart) overdue++;
      else if (d < tomorrowStart) todayDue++;
    }
  }

  const byDay = new Map<string, number>();
  const completionDays = new Set<string>();
  for (const t of allTasks) {
    if (!t.completedAt) continue;
    const key = format(new Date(t.completedAt), "yyyy-MM-dd");
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
    completionDays.add(key);
  }

  const series = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(todayStart, 13 - i);
    const key = format(d, "yyyy-MM-dd");
    return { day: format(d, "d MMM", { locale: es }), key, count: byDay.get(key) ?? 0 };
  });

  let streak = 0;
  let cursor = todayStart;
  if (!completionDays.has(format(cursor, "yyyy-MM-dd"))) cursor = subDays(cursor, 1);
  while (completionDays.has(format(cursor, "yyyy-MM-dd"))) {
    streak++;
    cursor = subDays(cursor, 1);
  }

  const byProject = allProjects.map((p) => {
    let pending = 0;
    let pdone = 0;
    for (const t of allTasks) {
      if (t.projectId !== p.id) continue;
      if (t.status === "done") pdone++;
      else pending++;
    }
    return { name: p.name, color: p.color, pending, done: pdone };
  });

  return {
    totals: { total: allTasks.length, done, overdue, todayDue },
    series,
    streak,
    byProject,
  };
}

export async function exportAllAsJson() {
  const allTasks = db.select().from(tasks).all();
  const allProjects = db.select().from(projects).all();
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), tasks: allTasks, projects: allProjects },
    null,
    2
  );
}
