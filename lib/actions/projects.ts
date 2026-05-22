"use server";

import { db } from "@/lib/db/client";
import { projects, tasks } from "@/lib/db/schema";
import { uid } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const PALETTE = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

/**
 * Cacheado por petición con React `cache()`: si varios server components piden
 * los proyectos durante el mismo render, solo se hace una consulta a la base.
 */
export const listProjects = cache(async () => {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      icon: projects.icon,
      count: sql<number>`(SELECT COUNT(*) FROM ${tasks} WHERE ${tasks.projectId} = ${projects.id} AND ${tasks.status} != 'done')`,
    })
    .from(projects)
    .orderBy(projects.position, projects.createdAt);
});

export async function createProject(name: string) {
  if (!name.trim()) return;
  const id = uid("prj");
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  await db.insert(projects).values({ id, name: name.trim(), color });
  revalidatePath("/", "layout");
  return id;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/", "layout");
}

export async function renameProject(id: string, name: string) {
  await db.update(projects).set({ name }).where(eq(projects.id, id));
  revalidatePath("/", "layout");
}
