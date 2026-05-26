-- ════════════════════════════════════════════════════════════════════
--   Seed data (datos de ejemplo) — OPCIONAL
--
--   Inserta proyectos y tareas ficticias para que veas la app con
--   contenido al abrirla por primera vez. Cero información personal,
--   cero conexión con datos reales.
--
--   Cómo aplicarlo:
--   - Con Supabase CLI:  supabase db reset   (¡borra todo y re-aplica
--                                              migraciones + seed!)
--   - O pega este archivo en el SQL Editor de Supabase.
--
--   Idempotente: si los registros ya existen, no los duplica.
-- ════════════════════════════════════════════════════════════════════

-- ── Proyectos ───────────────────────────────────────────────────────
INSERT INTO tareas.projects (id, name, color, icon, position) VALUES
  ('demo_prj_personal',  'Personal',   '#10b981', 'Folder', 0),
  ('demo_prj_trabajo',   'Trabajo',    '#6366f1', 'Folder', 1),
  ('demo_prj_estudios',  'Estudios',   '#f59e0b', 'Folder', 2)
ON CONFLICT (id) DO NOTHING;

-- ── Etiquetas ───────────────────────────────────────────────────────
INSERT INTO tareas.tags (id, name, color) VALUES
  ('demo_tag_urgente', 'urgente', '#ef4444'),
  ('demo_tag_compras', 'compras', '#10b981'),
  ('demo_tag_llamada', 'llamada', '#3b82f6')
ON CONFLICT (id) DO NOTHING;

-- ── Tareas ──────────────────────────────────────────────────────────
-- Mezcla pensada para que se vean todas las vistas:
--   · 2 tareas tutorial sin proyecto
--   · varias para hoy, mañana y esta semana
--   · 3 completadas recientes (alimentan Historial y la racha)
INSERT INTO tareas.tasks
  (id, title, description, status, priority, due_date, completed_at, project_id)
VALUES
  -- Tutorial / bienvenida
  ('demo_tsk_001', 'Bienvenido a tu app de tareas',
   'Haz clic en una tarea para abrir el panel y editarla. Usa la barra de arriba para agregar nuevas.',
   'todo', 'high', now(), NULL, NULL),

  ('demo_tsk_002', 'Marca esta tarea como hecha',
   'Haz clic en el círculo gris a la izquierda. Verás cómo aparece en Historial.',
   'todo', 'medium', now(), NULL, NULL),

  -- Personal
  ('demo_tsk_003', 'Comprar leche y pan', NULL,
   'todo', 'low', now() + interval '1 day', NULL, 'demo_prj_personal'),

  ('demo_tsk_004', 'Llamar al doctor para cita anual', NULL,
   'todo', 'high', now() + interval '2 days', NULL, 'demo_prj_personal'),

  ('demo_tsk_005', 'Hacer ejercicio 30 minutos', NULL,
   'todo', 'none', now(), NULL, 'demo_prj_personal'),

  -- Trabajo
  ('demo_tsk_006', 'Enviar reporte semanal al jefe', NULL,
   'todo', 'urgent', now() + interval '1 day', NULL, 'demo_prj_trabajo'),

  ('demo_tsk_007', 'Revisar correos pendientes', NULL,
   'todo', 'low', NULL, NULL, 'demo_prj_trabajo'),

  ('demo_tsk_008', 'Preparar presentación del lunes', NULL,
   'todo', 'high', now() + interval '4 days', NULL, 'demo_prj_trabajo'),

  -- Estudios
  ('demo_tsk_009', 'Estudiar capítulo 5 del libro', NULL,
   'todo', 'medium', now() + interval '3 days', NULL, 'demo_prj_estudios'),

  -- Completadas (Historial)
  ('demo_tsk_010', 'Sacar la basura', NULL,
   'done', 'none',
   now() - interval '1 day', now() - interval '1 day', 'demo_prj_personal'),

  ('demo_tsk_011', 'Reunión con el equipo', NULL,
   'done', 'medium',
   now() - interval '2 days', now() - interval '2 days', 'demo_prj_trabajo'),

  ('demo_tsk_012', 'Pagar la luz', NULL,
   'done', 'high',
   now() - interval '3 days', now() - interval '3 days', 'demo_prj_personal')
ON CONFLICT (id) DO NOTHING;

-- ── Etiquetas asignadas a tareas ────────────────────────────────────
INSERT INTO tareas.task_tags (task_id, tag_id) VALUES
  ('demo_tsk_003', 'demo_tag_compras'),
  ('demo_tsk_004', 'demo_tag_llamada'),
  ('demo_tsk_006', 'demo_tag_urgente'),
  ('demo_tsk_008', 'demo_tag_urgente'),
  ('demo_tsk_012', 'demo_tag_compras')
ON CONFLICT (task_id, tag_id) DO NOTHING;
