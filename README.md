# App de Seguimiento de Tareas

App web para llevar el control de tus tareas. Esta versión es **100 % local**:
no requiere cuentas en internet, ni servicios externos. Tu base de datos es un
archivo en tu propia computadora.

Pensada para que un alumno principiante la corra en 2 comandos.

---

## Cómo arrancarla

Necesitas tener **Node.js 18 o superior** instalado (descárgalo en
https://nodejs.org si no lo tienes).

Dentro de la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre **http://localhost:3000** y listo.

La primera vez se crea automáticamente una base de datos en `data/tareas.db`
con algunas tareas de ejemplo para que veas cómo se ve. Si quieres empezar
en blanco, borra ese archivo y reinicia.

---

## Cómo se usa

### Vistas (barra lateral)

| Vista | Para qué |
|---|---|
| **Hoy** | Lo pendiente para hoy. |
| **Todas** | Todas tus tareas pendientes, con filtros por fecha. |
| **Calendario** | Tus tareas en un calendario mensual. |
| **Tablero** | Vista Kanban: arrastra entre "Por hacer", "En progreso" y "Hecho". |
| **Historial** | Tareas que ya completaste, con filtros. |

### Crear tareas rápido

En la barra "¿Qué necesitas hacer?" puedes escribir natural:

```
Pagar la luz mañana 6pm !alta #casa @hogar
```

| Si escribes... | Significa... |
|---|---|
| `mañana`, `hoy`, `lunes`, `25/12` | Fecha límite |
| `6pm`, `14:30` | Hora |
| `!alta`, `!urgente`, `!media`, `!baja` | Prioridad |
| `#etiqueta` | Una etiqueta |
| `@proyecto` | Asignar a un proyecto |

### Editar una tarea

Haz clic en cualquier tarea para abrir el panel de edición. Ahí cambias
fecha, prioridad, proyecto, notas o la eliminas.

### Atajos

| Tecla | Acción |
|---|---|
| `⌘ K` (Mac) / `Ctrl K` (Win) | Buscador de comandos (cambiar vista, buscar tareas) |
| `c` | Cursor en la barra para añadir tarea |

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la app (modo desarrollo) |
| `npm run build` | Compila la versión optimizada |
| `npm run start` | Arranca la versión compilada |
| `npm run db:studio` | Abre un panel visual para ver tu base de datos |

---

## Notas

- La base de datos vive en `data/tareas.db` (archivo SQLite). Es solo tuya,
  no se sube a ningún servidor.
- Para hacer respaldo, copia ese archivo. Para empezar de cero, bórralo.
- La carpeta `data/` está en `.gitignore` — si subes el código no se sube tu
  base de datos.

---

## Tecnologías

Next.js 15, React, TypeScript, Tailwind CSS, SQLite (better-sqlite3),
Drizzle ORM.
