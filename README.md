# App de Seguimiento de Tareas Personales

Aplicación web para llevar el control de tus tareas del día a día, con una
interfaz oscura, limpia y rápida. Pensada para uso personal.

---

## ¿Qué hace esta app?

Te permite **anotar, organizar y dar seguimiento a tus tareas**. Puedes
agruparlas por proyectos, ponerles prioridad y fecha límite, marcarlas como
completadas y ver tu progreso con estadísticas.

Toda la información se guarda en una base de datos en la nube (**Supabase**),
así que tus tareas están respaldadas automáticamente.

---

## Vistas disponibles

La barra lateral izquierda te deja moverte entre estas vistas:

| Vista | Para qué sirve |
|---|---|
| **Inbox** | Tareas sueltas que aún no asignaste a un proyecto. |
| **Hoy** | Lo que tienes pendiente para el día de hoy. |
| **Próximos 7 días** | Lo que viene en la semana. |
| **Vencidas** | Tareas con fecha pasada que no completaste. |
| **Completadas** | Historial de lo que ya terminaste (últimos 30 días). |
| **Tablero** | Vista estilo Kanban: arrastra tarjetas entre "Por hacer", "En progreso" y "Hecho". |
| **Calendario** | Tus tareas distribuidas en un calendario mensual. |
| **Dashboard** | Resumen con números, gráfico de productividad y racha de días. |

---

## Cómo crear tareas rápido

En la barra de "Añadir tarea" puedes escribir de forma natural y la app
entiende lo que pones. Por ejemplo:

```
Pagar la luz mañana 6pm !alta #casa @hogar
```

La app reconoce automáticamente:

| Si escribes... | Significa... |
|---|---|
| `mañana`, `hoy`, `lunes`, `25/12` | La fecha límite de la tarea. |
| `6pm`, `14:30` | La hora. |
| `!alta`, `!urgente`, `!media`, `!baja` | La prioridad. |
| `#etiqueta` | Una etiqueta para clasificar. |
| `@proyecto` | El proyecto al que pertenece. |

El resto del texto se queda como el título de la tarea.

---

## Atajos de teclado

| Atajo | Acción |
|---|---|
| `⌘ K` (o `Ctrl K`) | Abre el buscador de comandos: crear tareas y saltar entre vistas. |
| `c` | Pone el cursor en la barra para añadir una tarea nueva. |

---

## Cómo arrancar la app en tu computadora

1. Asegúrate de tener instalado **Node.js** (versión 18 o superior).
2. Abre una terminal dentro de la carpeta del proyecto.
3. Instala las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

4. Arranca la aplicación:

   ```bash
   npm run dev
   ```

5. Abre tu navegador en **http://localhost:3000**

> Para que funcione, debe existir un archivo llamado `.env` en la carpeta del
> proyecto con la conexión a la base de datos. Ese archivo es **privado** y no
> se sube a GitHub.

---

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la app en modo desarrollo (uso normal). |
| `npm run build` | Prepara una versión optimizada para producción. |
| `npm run start` | Arranca la versión de producción. |
| `npm run db:studio` | Abre un panel visual para ver la base de datos. |

---

## Cómo está organizado el proyecto

```
app/          Las páginas y vistas de la aplicación
components/   Piezas reutilizables de la interfaz (barra lateral, tareas, etc.)
lib/
  db/         Conexión y estructura de la base de datos
  actions/    Lógica para crear, editar y consultar tareas
  parser/     El "traductor" que entiende el texto natural al crear tareas
```

---

## Tecnologías que usa

- **Next.js 15** y **React** — el motor de la aplicación.
- **TypeScript** — para escribir código más seguro.
- **Tailwind CSS** — para el diseño visual (estilo oscuro tipo Linear).
- **Supabase (PostgreSQL)** — la base de datos en la nube donde se guardan las tareas.
- **Drizzle ORM** — la herramienta que conecta la app con la base de datos.

---

## Notas importantes

- Como la base de datos está en la nube, **la app necesita conexión a internet**
  para funcionar.
- El archivo `.env` contiene datos sensibles (la contraseña de la base de datos).
  Nunca debe compartirse ni subirse a internet.
- Tus tareas quedan respaldadas automáticamente en Supabase.

---

Proyecto personal de seguimiento de tareas. Desarrollado con la asistencia de Claude.
