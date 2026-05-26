# App de Seguimiento de Tareas

App web para llevar el control de tus tareas del día a día. Interfaz oscura
estilo Linear/Todoist. La base de datos vive en tu propia cuenta de Supabase
(gratis), así que tus tareas están respaldadas en la nube.

Esta guía está pensada para que **cualquier persona sin experiencia técnica**
pueda tenerla corriendo en su computadora en ~10 minutos.

---

## Antes de empezar

Necesitas tener instalado **Node.js versión 18 o superior**.

Verifica con:

```bash
node --version
```

Si no lo tienes, instálalo desde **https://nodejs.org** (versión "LTS").

---

## Paso 1 · Clona el proyecto

```bash
git clone https://github.com/dantedelaopruebas/app-seguimiento-tareas.git
cd app-seguimiento-tareas
npm install
```

`npm install` tarda 1-2 minutos la primera vez.

---

## Paso 2 · Crea tu cuenta y proyecto en Supabase

Supabase es donde vivirá tu base de datos. Es **gratis** para uso personal.

1. Entra a **https://supabase.com** y crea una cuenta.
2. Una vez dentro, clic en **New project**:
   - **Name**: el que quieras (ej. `mis-tareas`).
   - **Database Password**: pon cualquier contraseña. **No te preocupes en
     recordarla**, el setup va a generar una nueva más segura por ti.
   - **Region**: la más cercana a ti.
3. Espera ~2 minutos a que el proyecto termine de aprovisionarse.

---

## Paso 3 · Genera tu Personal Access Token

Este token le da permiso al setup para preparar tu base de datos.

1. Ve a **https://supabase.com/dashboard/account/tokens**
2. **Generate new token** → ponle nombre (ej. `setup-tareas`) → **Generate**
3. **Copia el token** (empieza con `sbp_...`) — solo se muestra una vez.

---

## Paso 4 · Configura el proyecto automáticamente

Tienes **dos caminos**, elige el que prefieras:

### Camino A · Con Claude Code (más fácil, conversacional)

Si tienes Claude Code instalado, ábrelo dentro de la carpeta del proyecto y
escribe en el chat:

> **"configura mi proyecto"**

Claude detectará automáticamente la skill `setup-tareas` que vive en el repo,
te pedirá tu token y tus datos de login, y se encargará del resto. Tú solo
contestas sus preguntas en lenguaje natural.

### Camino B · Manual con un solo comando

Desde la terminal, dentro de la carpeta del proyecto:

```bash
npm run setup
```

El script te pide en orden:

1. Tu **Personal Access Token** de Supabase (pégalo y dale Enter)
2. Cuál proyecto Supabase usar (si solo tienes uno, lo detecta solo)
3. Email para entrar a la app (puede ser ficticio, ej. `tu@tareas.app`)
4. Contraseña (la que tú quieras, o déjalo vacío y te genera una)

Mientras tanto el script, sin que hagas nada más:

- Crea todas las tablas necesarias en tu base de datos
- Crea tu usuario para entrar a la app
- Deshabilita el registro público (solo tú podrás entrar)
- Genera una contraseña fuerte para la base
- Crea el archivo `.env` con todas las credenciales listas

Al final te muestra **tus credenciales** (email + contraseña) —
**guárdalas en un lugar seguro**.

---

## Paso 5 · Arranca la app

```bash
npm run dev
```

Abre **http://localhost:3000** y entra con el email y contraseña del paso
anterior.

---

## Cómo usar la app

### Vistas (barra lateral)

| Vista | Para qué |
|---|---|
| **Hoy** | Tareas pendientes para hoy. |
| **Todas** | Todas las pendientes, con filtros por fecha. |
| **Calendario** | Vista mensual de tus tareas. |
| **Tablero** | Vista Kanban: arrastra entre "Por hacer", "En progreso" y "Hecho". |
| **Historial** | Tareas completadas, con filtros por período. |

### Crear tareas rápido

En la barra "¿Qué necesitas hacer?" escribe en lenguaje natural:

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

Haz clic en cualquier tarea para abrir el panel de edición.

### Atajos

| Tecla | Acción |
|---|---|
| `⌘ K` / `Ctrl K` | Buscador de comandos |
| `c` | Cursor en la barra para añadir tarea |

---

## (Opcional) Publica tu app en internet con Vercel

Si quieres acceder a tu app desde cualquier dispositivo:

1. Crea cuenta en **https://vercel.com**
2. Instala el CLI: `npm install -g vercel`
3. Desde la carpeta: `vercel` → sigue las preguntas (link nuevo proyecto)
4. Sube tus variables: ve a Settings → Environment Variables en Vercel y
   pega las 3 variables de tu `.env`
5. Despliega: `vercel --prod`

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `npm install` falla | Verifica `node --version` ≥ 18 |
| `npm run setup` dice token inválido | Genera otro en https://supabase.com/dashboard/account/tokens |
| Proyecto en estado `COMING_UP` | Espera 1-2 min y vuelve a correrlo |
| `/login` dice credenciales incorrectas | Usa exactamente el email y contraseña que el script mostró al final |
| Olvidé mi contraseña | Corre `npm run setup` con un email distinto (se crea otro usuario) o reseteala desde Supabase Dashboard → Authentication → Users |

---

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run setup` | Configura tu Supabase desde cero (lo corres una vez al inicio) |
| `npm run dev` | Arranca la app en local |
| `npm run build` | Compila la versión optimizada |
| `npm run start` | Sirve la versión compilada |
| `npm run db:studio` | Panel visual para inspeccionar tu base de datos |

---

## Tecnologías

Next.js 15, React, TypeScript, Tailwind CSS, Supabase (Postgres) y Drizzle ORM.
