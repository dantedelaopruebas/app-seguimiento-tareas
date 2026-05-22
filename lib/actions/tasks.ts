"use server";

import { db } from "@/lib/db/client";
import { tasks, projects, tags, taskTags, activityLog } from "@/lib/db/schema";
import { uid } from "@/lib/utils";
import { and, eq, isNull, gte, lte, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseQuickAdd } from "@/lib/parser/quick-add";
import { endOfDay, startOfDay, addDays } from "date-fns";

async function ensureProject(name: string) {
  const existing = (
    await db
      .select()
      .from(projects)
      .where(sql`lower(${projects.name}) = ${name.toLowerCase()}`)
      .limit(1)
  )[0];
  if (existing) return existing;
  const id = uid("prj");
  await db.insert(projects).values({ id, name }).returning();
  return { id, name } as typeof projects.$inferSelect;
}

async function ensureTags(names: string[]) {
  const ids: string[] = [];
  for (const n of names) {
    const existing = (await db.select().from(tags).where(eq(tags.name, n)).limit(1))[0];
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const id = uid("tag");
    await db.insert(tags).values({ id, name: n });
    ids.push(id);
  }
  return ids;
}

export async function createTaskFromInput(input: string, defaultProjectId?: string | null) {
  const parsed = parseQuickAdd(input);
  if (!parsed.title) return { ok: false, error: "Título vacío" };

  let projectId: string | null = defaultProjectId ?? null;
  if (parsed.projectName) {
    const p = await ensureProject(parsed.projectName);
    projectId = p.id;
  }

  const id = uid("tsk");
  await db.insert(tasks).values({
    id,
    title: parsed.title,
    priority: parsed.priority,
    dueDate: parsed.dueDate ?? null,
    projectId,
  });

  if (parsed.tags.length) {
    const tagIds = await ensureTags(parsed.tags);
    for (const tid of tagIds) {
      await db.insert(taskTags).values({ taskId: id, tagId: tid });
    }
  }

  await db.insert(activityLog).values({ id: uid("act"), taskId: id, action: "created" });
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function toggleTask(id: string) {
  const t = (await db.select().from(tasks).where(eq(tasks.id, id)).limit(1))[0];
  if (!t) return;
  const done = t.status === "done";
  await db
    .update(tasks)
    .set({
      status: done ? "todo" : "done",
      completedAt: done ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  await db
    .insert(activityLog)
    .values({ id: uid("act"), taskId: id, action: done ? "reopened" : "completed" });
  revalidatePath("/", "layout");
}

export async function deleteTask(id: string) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/", "layout");
}

export async function updateTask(
  id: string,
  patch: Partial<{
    title: string;
    description: string | null;
    priority: "none" | "low" | "medium" | "high" | "urgent";
    status: "todo" | "in_progress" | "done";
    dueDate: Date | null;
    projectId: string | null;
  }>
) {
  await db.update(tasks).set({ ...patch, updatedAt: new Date() }).where(eq(tasks.id, id));
  revalidatePath("/", "layout");
}

export async function moveTaskStatus(
  id: string,
  status: "todo" | "in_progress" | "done",
  position: number
) {
  await db
    .update(tasks)
    .set({
      status,
      position,
      completedAt: status === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/", "layout");
}

export interface TaskFilter {
  scope?: "inbox" | "today" | "next7" | "overdue" | "all" | "done";
  projectId?: string;
}

export async function listCompletedToday(scopeProjectId?: string | null) {
  const todayStart = startOfDay(new Date());
  const conditions: any[] = [
    eq(tasks.status, "done"),
    gte(tasks.completedAt, todayStart),
  ];
  if (scopeProjectId !== undefined) {
    if (scopeProjectId === null) conditions.push(isNull(tasks.projectId));
    else conditions.push(eq(tasks.projectId, scopeProjectId));
  }
  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.completedAt));
}

export async function listAllCompleted(days = 30) {
  const from = new Date(Date.now() - days * 86400000);
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.status, "done"), gte(tasks.completedAt, from)))
    .orderBy(desc(tasks.completedAt));
}

export async function listTasks(filter: TaskFilter = {}) {
  const now = new Date();
  const todayEnd = endOfDay(now);
  const todayStart = startOfDay(now);

  const conditions: any[] = [];
  if (filter.scope === "inbox") {
    conditions.push(isNull(tasks.projectId));
    conditions.push(sql`${tasks.status} != 'done'`);
  } else if (filter.scope === "today") {
    conditions.push(lte(tasks.dueDate, todayEnd));
    conditions.push(sql`${tasks.status} != 'done'`);
  } else if (filter.scope === "next7") {
    conditions.push(and(gte(tasks.dueDate, todayStart), lte(tasks.dueDate, endOfDay(addDays(now, 7)))));
    conditions.push(sql`${tasks.status} != 'done'`);
  } else if (filter.scope === "overdue") {
    conditions.push(lte(tasks.dueDate, todayStart));
    conditions.push(sql`${tasks.status} != 'done'`);
  } else if (filter.scope === "done") {
    conditions.push(eq(tasks.status, "done"));
  } else if (filter.projectId) {
    conditions.push(eq(tasks.projectId, filter.projectId));
  }

  return db
    .select()
    .from(tasks)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(tasks.status), asc(tasks.dueDate), desc(tasks.createdAt));
}

export async function listAllTasksWithRelations() {
  const [allTasks, allProjects, allTags, relations] = await Promise.all([
    db.select().from(tasks).orderBy(asc(tasks.position), desc(tasks.createdAt)),
    db.select().from(projects),
    db.select().from(tags),
    db.select().from(taskTags),
  ]);
  return { tasks: allTasks, projects: allProjects, tags: allTags, taskTags: relations };
}
