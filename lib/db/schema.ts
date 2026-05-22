import { pgSchema, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";

// Todas las tablas viven en un schema aislado "tareas" dentro del proyecto
// Supabase APPS_CLAUDE, para no chocar con otras apps en el mismo proyecto.
export const tareas = pgSchema("tareas");

export const projects = tareas.table("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  icon: text("icon").notNull().default("Folder"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = tareas.table("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "done"] })
    .notNull()
    .default("todo"),
  priority: text("priority", { enum: ["none", "low", "medium", "high", "urgent"] })
    .notNull()
    .default("none"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  parentTaskId: text("parent_task_id"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tags = tareas.table("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#a3a3a3"),
});

export const taskTags = tareas.table(
  "task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.tagId] }) })
);

export const activityLog = tareas.table("activity_log", {
  id: text("id").primaryKey(),
  taskId: text("task_id"),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
