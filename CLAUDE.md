# CLAUDE.md

Guía para futuras sesiones de Claude trabajando en este repositorio.

## El proyecto en una frase

App web personal de seguimiento de tareas (estilo Linear/Todoist) en
Next.js 15 + Supabase. Diseño oscuro, una sola persona la usa, está
desplegada en Vercel.

- Producción: https://app-seguimiento-tareas.vercel.app
- Repo público: https://github.com/dantedelaopruebas/app-seguimiento-tareas
- Usuario del owner: `dante@tareas.app` / `MisTareas2026!` (login local
  y producción).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 18 |
| Lenguaje | TypeScript estricto |
| UI | Tailwind CSS 3, componentes propios, `lucide-react`, `cmdk`, `@dnd-kit`, `recharts`, `framer-motion` |
| Estado cliente | Zustand (`useData`, `useTaskEditor`, `useToast`, `useCommandPalette`) |
| Base de datos | Supabase Postgres (proyecto `APPS_CLAUDE`, ref `vsrgmcgkyjvpzgefevkq`) |
| ORM | Drizzle (`drizzle-orm/pg-core` + `drizzle-orm/postgres-js`) |
| Driver Postgres | `postgres` (postgres-js) sobre el **Transaction Pooler** (puerto 6543) |
| Auth | Supabase Auth (email/password) con `@supabase/ssr` |

## Arquitectura clave

**Patrón general: server fetch único + store cliente + mutaciones optimistas.**

1. **`app/(dashboard)/layout.tsx`** es server component y hace UNA SOLA
   carga: `listProjects()` + `listDashboardTasks()` (pendientes + últimas
   30 días completadas) + usuario actual. Pasa todo a `<DataProvider>`.
2. **`components/data/provider.tsx`** hidrata un store Zustand
   (`components/data/store.ts`) con los datos iniciales.
3. **Cada página es un wrapper trivial** (`app/(dashboard)/today/page.tsx`,
   `all/page.tsx`, etc.) que renderiza un componente en
   `components/views/` marcado como `"use client"`.
4. Esos componentes view LEEN DEL STORE y filtran en memoria. Navegar
   entre vistas NO hace consultas a la nube.
5. Las mutaciones (toggle, crear, editar, borrar) hacen:
   - Actualización **optimista** del store en cliente
   - Llamada al server action en `lib/actions/`
   - El server action escribe a Supabase y hace `revalidatePath("/", "layout")`
     para mantener la siguiente hidratación fresca.

**Si tienes que añadir una vista o un campo, sigue este patrón** — no
añadas server fetches por página, eso revierte la mejora de performance.

## Schema de la base de datos

Vive en un **schema Postgres dedicado llamado `tareas`** dentro de la
base `postgres` del proyecto Supabase. Esto es para aislar las tablas si
en el futuro otras apps comparten el mismo proyecto.

Tablas (ver `lib/db/schema.ts`):

- `tareas.projects` — proyectos (id, name, color, icon, position, created_at)
- `tareas.tasks` — tareas (id, title, description, status, priority,
  due_date, completed_at, project_id, parent_task_id, position,
  created_at, updated_at)
- `tareas.tags` — etiquetas
- `tareas.task_tags` — relación N:N tareas↔tags
- `tareas.activity_log` — registro de cambios (created, completed, reopened)

Cambios al schema se hacen con Drizzle (`npm run db:generate`) o
directamente vía MCP de Supabase (`apply_migration`).

## Autenticación

- **Registro público DESHABILITADO** a nivel proyecto Supabase. Solo
  existe el usuario `dante@tareas.app`.
- **Middleware** (`middleware.ts`) hace una comprobación **cookie-only**
  (busca cookie `sb-...-auth-token`). NO llama a `supabase.auth.getUser()`
  para evitar viaje a red en cada navegación.
- El layout sí llama a `getUser()` UNA vez al cargar la app — eso obtiene
  el email para mostrar en la sidebar.
- Server actions en `lib/actions/auth.ts`: `loginAction`, `logoutAction`.
- Cliente Supabase: `lib/supabase/server.ts` y `lib/supabase/client.ts`.

Si necesitas crear un usuario más, hazlo vía SQL en el schema `auth.users`
+ `auth.identities` (ver historial de commits para el snippet).

## Comandos de desarrollo

```bash
npm run dev         # http://localhost:3000
npm run build       # build de producción (corre TS check — bloquea si hay errores)
npm run start       # sirve el build
npm run db:generate # genera migración a partir del schema Drizzle
npm run db:push     # aplica el schema actual a la base remota
npm run db:studio   # GUI para inspeccionar la base
```

`npm run dev` esconde errores de TypeScript. **`npm run build` los
muestra** — antes de desplegar, corre `npx tsc --noEmit` para atraparlos.

## Despliegue (Vercel)

- Proyecto Vercel: `app-seguimiento-tareas` (id `prj_JZl4ZcsCoFObO2BAvYJ8uqNHf32W`,
  scope `team_ZqcLbYeWxo3uOCIsr3cssUFR` = "APPS_CURSOCLAUDE's projects",
  que en realidad es la cuenta personal `ziyabas805` migrada a "team").
- Las 3 env vars (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ya están cargadas en production y
  development en Vercel.
- Deploy:
  ```bash
  export VERCEL_TOKEN="vcp_..."
  vercel deploy --prod --yes
  ```
- **Deployment Protection desactivada** (URL pública). Si Vercel la
  re-activa por algún cambio, deshabilitar con:
  ```bash
  curl -X PATCH -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" -d '{"ssoProtection":null}' \
    "https://api.vercel.com/v9/projects/prj_JZl4ZcsCoFObO2BAvYJ8uqNHf32W?teamId=team_ZqcLbYeWxo3uOCIsr3cssUFR"
  ```
- Si un deploy queda en estado `BLOCKED`: la cuenta Vercel necesita
  verificación (login al dashboard). Pasó la primera vez.

## MCPs disponibles

- **Supabase MCP** (`mcp__supabase__*`) — scoped al proyecto
  `vsrgmcgkyjvpzgefevkq`, lectura y escritura. Útil para `list_tables`,
  `execute_sql`, `apply_migration`, `get_logs`, `get_advisors`. Usar
  preferentemente para inspección y consultas; CLI/curl para operaciones
  más invasivas.
- **Preview** (`mcp__Claude_Preview__*`) — controla el dev server local
  y hace screenshots/clicks para verificar UI.

## Reglas de oro (cosas que ya rompieron una vez)

1. **No re-fetchear datos en cada page.tsx.** Si la vista usa tareas,
   léelas del store (`useData`). Solo el layout hace fetch.
2. **Con el pooler en modo transacción (6543) usa `prepare: false`** en
   postgres-js — está en `lib/db/client.ts`. Sin esto, queries fallan.
3. **En serverless (Vercel) usa `max: 1`** en el pool de postgres-js —
   ya configurado vía detección de `process.env.VERCEL`. Subirlo
   exhaurta el pooler de Supabase con cold starts.
4. **TypeScript estricto rompe builds de producción.** Si `tsc --noEmit`
   da error, el deploy fallará. Casos vistos: narrowing perdido en
   callbacks de `.replace`, parámetros `any` implícitos en callbacks de
   `@supabase/ssr` (`setAll`).
5. **Middleware NO debe llamar a `getUser()`.** Quedó como cookie-only
   por performance — cambiar esto vuelve la nav 200ms más lenta.
6. **El clasificador de seguridad de Claude Code bloquea operaciones
   sensibles en Supabase** (resetear contraseña maestra, tocar proyectos
   no aprobados explícitamente). Si te lo bloquea, pídele permiso al
   usuario antes de re-intentar.
7. **`.env*` está gitignored excepto `.env.example`.** Nunca commitees
   secretos.

## Convenciones de código

- **Idioma:** español en UI, comentarios y commits. Identificadores en
  inglés cuando sea natural (`tasks`, `projects`).
- **Server actions** en `lib/actions/` con `"use server"`. Devuelven el
  dato actualizado cuando aplique (ej. `createTaskFromInput` retorna el
  task insertado para hidratar el store optimistamente).
- **Componentes "view"** (`components/views/*`) son `"use client"` y
  leen del store Zustand. Las pages son thin wrappers server.
- **Mutaciones siempre tienen contraparte optimista** en el store antes
  de llamar al server action.
- **Toasts** vía `useToast` (`components/toast.tsx`) para feedback
  inmediato en mutaciones.
- **Editor de tarea**: un único Side Sheet montado en el layout, abierto
  vía `useTaskEditor.open(task)` desde cualquier `TaskRow`.

## Estructura del proyecto

```
app/
  (dashboard)/
    layout.tsx           # carga única + DataProvider + sidebar/editor/palette
    loading.tsx          # skeleton mientras hidrata
    today/page.tsx       # wrapper → <TodayView/>
    all/page.tsx         # wrapper → <AllPageView/>
    board/page.tsx       # wrapper → <BoardView/>
    calendar/page.tsx    # wrapper → <CalendarView/>
    history/page.tsx     # vista server + filtros (NO usa store)
    project/[id]/page.tsx
    completed/page.tsx   # redirect → /history (compat)
    inbox/page.tsx       # redirect → /all     (compat)
    overdue/page.tsx     # redirect → /today   (compat)
    dashboard/page.tsx   # stats (no en sidebar, accesible por URL)
  login/page.tsx         # formulario de login
  page.tsx               # redirect → /today
components/
  data/                  # store Zustand + provider de hidratación
  views/                 # componentes client que leen del store
  tasks/                 # TaskRow, TaskList, QuickAdd, TaskEditor, CompletedSection
  board/kanban.tsx       # Kanban con @dnd-kit
  calendar/month-view.tsx
  history/history-view.tsx
  auth/                  # login-form, logout-button
  dashboard/             # charts, export
  sidebar.tsx, topbar.tsx, command-palette.tsx, toast.tsx
lib/
  db/
    client.ts            # postgres-js + drizzle, con max:1 en Vercel
    schema.ts            # Drizzle pgSchema('tareas')
  actions/               # server actions: tasks, projects, auth, stats
  parser/quick-add.ts    # parser de "comprar pan mañana !alta #casa @hogar"
  supabase/              # clientes server y browser de @supabase/ssr
  utils.ts               # cn(), uid()
middleware.ts            # cookie-only auth check
```

## Cosas que NO conviene cambiar sin pensarlo dos veces

- Quitar el `revalidatePath("/", "layout")` de los server actions: rompe
  la frescura de datos al volver a la app después de mutar.
- Volver páginas a server components que hacen fetch: rompe el patrón
  perf y hace que `useData` quede inconsistente.
- Cambiar el schema `tareas` por `public` sin coordinar: rompe todas
  las queries que usan `pgSchema('tareas').table(...)`.
- Reactivar el registro público en Supabase: la app no tiene página de
  registro; quedaría como "fantasma" abierto a internet.

## Cómo verificar cambios

1. Cambios de UI: usar Claude_Preview (`preview_start`, `preview_eval`,
   `preview_screenshot`) en el dev server local. Verificar también el
   ancho del viewport — el sidebar se ve raro si la ventana es <800px.
2. Cambios de DB: ejecutar SQL con MCP Supabase (`execute_sql`) para
   verificar persistencia.
3. Cambios de auth: probar /login en navegador, verificar redirect a
   /today, verificar logout vuelve a /login.
4. Antes de deploy: `npx tsc --noEmit` SIEMPRE. Si hay errores, el
   build de Vercel los va a atrapar 2 minutos después y va a doler más.
