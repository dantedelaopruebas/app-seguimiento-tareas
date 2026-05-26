import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tareas.db");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
}

const sqlite = global.__sqlite ?? new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
if (process.env.NODE_ENV !== "production") global.__sqlite = sqlite;

bootstrap(sqlite);

export const db = drizzle(sqlite, { schema });

/**
 * Crea las tablas si no existen y, si la base está vacía, inserta datos de
 * ejemplo para que el alumno vea algo al abrir la app.
 */
function bootstrap(s: Database.Database) {
  s.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      icon TEXT NOT NULL DEFAULT 'Folder',
      position INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'none',
      due_date INTEGER,
      completed_at INTEGER,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      parent_task_id TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#a3a3a3'
    );
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      action TEXT NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);

  // Seed con datos de ejemplo solo si la tabla de tareas está vacía
  const count = (s.prepare("SELECT COUNT(*) AS n FROM tasks").get() as { n: number }).n;
  if (count === 0) seed(s);
}

function seed(s: Database.Database) {
  const now = Date.now();
  const day = 86400000;
  const uid = (p: string) =>
    `${p}_${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const personalId = uid("prj");
  const trabajoId = uid("prj");

  s.prepare(
    "INSERT INTO projects (id, name, color, icon, position, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(personalId, "Personal", "#10b981", "Folder", 0, now);
  s.prepare(
    "INSERT INTO projects (id, name, color, icon, position, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(trabajoId, "Trabajo", "#6366f1", "Folder", 1, now);

  const tasks: [string, string | null, "todo" | "done", string, number | null, string | null][] = [
    ["Bienvenido a tu app de tareas", "Da clic en una tarea para editarla. Usa la barra de arriba para agregar nuevas.", "todo", "high", now, null],
    ["Marca esta tarea como hecha", "Haz clic en el círculo de la izquierda.", "todo", "medium", now, null],
    ["Comprar leche", null, "todo", "none", now + day, personalId],
    ["Llamar al doctor para cita", null, "todo", "high", now + day * 2, personalId],
    ["Enviar reporte semanal", null, "todo", "urgent", now + day, trabajoId],
    ["Revisar correos pendientes", null, "todo", "low", now + day * 3, trabajoId],
    ["Preparar presentación del lunes", null, "todo", "high", now + day * 4, trabajoId],
    ["Ejemplo de tarea ya completada", null, "done", "none", null, null],
  ];

  const insert = s.prepare(
    "INSERT INTO tasks (id, title, description, status, priority, due_date, completed_at, project_id, parent_task_id, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const [title, desc, status, priority, dueDate, projectId] of tasks) {
    const id = uid("tsk");
    const completedAt = status === "done" ? now - day : null;
    insert.run(id, title, desc, status, priority, dueDate, completedAt, projectId, null, 0, now, now);
  }
}
