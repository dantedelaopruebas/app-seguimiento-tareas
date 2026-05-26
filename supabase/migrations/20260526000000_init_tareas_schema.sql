-- ════════════════════════════════════════════════════════════════════
--   Migración inicial: schema "tareas" con sus 5 tablas e índices.
--   Construida por introspección del schema en producción
--   (information_schema + pg_indexes + pg_constraints) para que sea
--   idéntica al estado actual de la base.
--
--   Aplicar con: supabase db push  (con el repo linkeado a tu proyecto)
-- ════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS tareas;

-- ── projects ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas.projects (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#6366f1',
  icon        text NOT NULL DEFAULT 'Folder',
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── tasks ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas.tasks (
  id              text PRIMARY KEY,
  title           text NOT NULL,
  description     text,
  status          text NOT NULL DEFAULT 'todo',
  priority        text NOT NULL DEFAULT 'none',
  due_date        timestamptz,
  completed_at    timestamptz,
  project_id      text REFERENCES tareas.projects(id) ON DELETE SET NULL,
  parent_task_id  text,
  position        integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tareas.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due     ON tareas.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status  ON tareas.tasks(status);

-- ── tags ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas.tags (
  id     text PRIMARY KEY,
  name   text NOT NULL UNIQUE,
  color  text NOT NULL DEFAULT '#a3a3a3'
);

-- ── task_tags (N:N) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas.task_tags (
  task_id  text NOT NULL REFERENCES tareas.tasks(id) ON DELETE CASCADE,
  tag_id   text NOT NULL REFERENCES tareas.tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ── activity_log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas.activity_log (
  id         text PRIMARY KEY,
  task_id    text,
  action     text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now()
);

-- ── Estado en producción al momento de extraer ─────────────────────
--   RLS:        deshabilitado en las 5 tablas
--   Triggers:   ninguno
--   Funciones:  ninguna
--   Policies:   ninguna
--
-- Si quieres añadir RLS más adelante, hazlo como migración separada
-- (no en este archivo) para mantener este como "estado actual".
