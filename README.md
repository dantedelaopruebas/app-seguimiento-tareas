# App de Seguimiento de Tareas Personales

Una app web para llevar el control de tus tareas del día a día. Interfaz oscura
estilo Linear, vistas de lista, tablero Kanban, calendario e historial. Todo se
guarda en una base de datos en la nube (Supabase).

Esta guía está pensada para que **cualquier persona sin experiencia técnica**
pueda tenerla corriendo en su computadora en unos 10 minutos.

---

## Antes de empezar

Necesitas tener instalado **Node.js versión 18 o superior**.

Para revisar si lo tienes, abre la Terminal y escribe:

```bash
node --version
```

Si te marca un número como `v20.x.x` ya estás. Si no, instálalo desde
**https://nodejs.org** (descarga la versión "LTS").

---

## Paso 1 · Clona el proyecto

Abre la Terminal en la carpeta donde quieras tener el proyecto y corre:

```bash
git clone https://github.com/dantedelaopruebas/app-seguimiento-tareas.git
cd app-seguimiento-tareas
```

> Si no tienes Git, puedes descargar el ZIP desde GitHub y descomprimirlo.

---

## Paso 2 · Instala las dependencias

Dentro de la carpeta del proyecto:

```bash
npm install
```

Tarda un par de minutos la primera vez.

---

## Paso 3 · Crea tu cuenta y proyecto en Supabase

Supabase es donde vivirá tu base de datos en la nube. Es **gratis** para uso
personal.

1. Entra a **https://supabase.com** y crea una cuenta (con tu correo o con
   GitHub).
2. Una vez dentro, clic en **New project**:
   - **Name**: el que quieras (por ejemplo, `mis-tareas`).
   - **Database Password**: pon cualquier contraseña — no te preocupes en
     recordarla, el script va a generar una nueva más adelante.
   - **Region**: la más cercana a ti.
3. Espera ~2 minutos a que el proyecto termine de aprovisionarse.

---

## Paso 4 · Genera tu Personal Access Token

Este token le da permiso al script de configuración para preparar la base de
datos por ti.

1. Ve a **https://supabase.com/dashboard/account/tokens**.
2. Clic en **Generate new token**.
3. Ponle un nombre (por ejemplo, `setup-tareas`) y clic en **Generate token**.
4. **Copia el token** (empieza con `sbp_...`) — solo se muestra una vez.

---

## Paso 5 · Configura el proyecto automáticamente

Aquí ocurre la magia. Corre:

```bash
npm run setup
```

El script te va a pedir:

1. **Tu Personal Access Token** → pega el que generaste.
2. **Cuál proyecto Supabase usar** → si solo tienes uno, lo detecta solo.
3. **Email para entrar a la app** → puede ser ficticio, ej. `tu@tareas.app`.
4. **Contraseña** → la que tú quieras, o déjalo vacío y te genera una.

Mientras tanto, el script (sin que tengas que hacer nada más):

- Crea todas las tablas necesarias en tu base de datos.
- Crea tu usuario para entrar a la app.
- Deshabilita el registro público (solo tú podrás entrar).
- Genera una contraseña fuerte para la base de datos.
- Crea el archivo `.env` con todas las credenciales listas.

Al final te muestra **tus credenciales** (email y contraseña) — guárdalas en un
lugar seguro.

---

## Paso 6 · Arranca la app

```bash
npm run dev
```

Abre **http://localhost:3000** en tu navegador. Te aparecerá la pantalla de
login. Entra con el email y contraseña que pusiste en el paso anterior.

---

## (Opcional) Paso 7 · Publica tu app en internet con Vercel

Si quieres acceder a tu app desde cualquier lado, puedes desplegarla **gratis**
en Vercel:

1. Crea cuenta en **https://vercel.com**.
2. Instala el CLI: `npm install -g vercel`.
3. Desde la carpeta del proyecto:
   ```bash
   vercel
   ```
4. Cuando pregunte, **link a un proyecto nuevo**. Luego copia tu `.env`
   completo y pega cada variable en el dashboard de Vercel (Settings →
   Environment Variables). Después corre:
   ```bash
   vercel --prod
   ```

---

## Cómo se usa la app

### Vistas principales (barra lateral)

| Vista | Para qué sirve |
|---|---|
| **Hoy** | Lo que tienes pendiente para el día de hoy. |
| **Todas** | Todas tus tareas pendientes con filtros (Hoy, Mañana, Esta semana, Atrasadas, Sin fecha...). |
| **Calendario** | Tus tareas en un calendario mensual. |
| **Tablero** | Vista Kanban: arrastra tarjetas entre "Por hacer", "En progreso" y "Hecho". |
| **Historial** | Tareas completadas con filtros por período y proyecto. |

### Cómo crear tareas

En la barra "¿Qué necesitas hacer?" puedes escribir en lenguaje natural:

```
Pagar la luz mañana 6pm !alta #casa @hogar
```

| Si escribes... | Significa... |
|---|---|
| `mañana`, `hoy`, `lunes`, `25/12` | Fecha límite. |
| `6pm`, `14:30` | Hora. |
| `!alta`, `!urgente`, `!media`, `!baja` | Prioridad. |
| `#etiqueta` | Una etiqueta. |
| `@proyecto` | A qué proyecto pertenece. |

### Editar una tarea

Haz clic en cualquier tarea para abrir el panel de edición. Ahí puedes cambiar
fecha, prioridad, proyecto, notas o eliminarla.

### Atajos de teclado

| Atajo | Acción |
|---|---|
| `⌘ K` (Mac) o `Ctrl K` (Windows) | Abre el buscador de comandos. |
| `c` | Pone el cursor en la barra para añadir una tarea. |

---

## Si algo no funciona

| Problema | Solución |
|---|---|
| `npm install` falla | Asegúrate de tener Node.js 18 o superior (`node --version`). |
| `npm run setup` dice "token inválido" | El token debe empezar con `sbp_`. Genéralo de nuevo en https://supabase.com/dashboard/account/tokens |
| `npm run setup` dice "proyecto en estado COMING_UP" | Espera 1-2 minutos a que Supabase termine de crear el proyecto y vuelve a correrlo. |
| El login dice "credenciales incorrectas" | Asegúrate de usar exactamente el email y contraseña que el script te mostró al final. |
| Olvidé mi contraseña | Vuelve a correr `npm run setup` con un email distinto, o restablécela desde el dashboard de Supabase (Authentication → Users). |
| Al abrir http://localhost:3000 no carga nada | Verifica que `npm run dev` siga corriendo en la terminal. |

---

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run setup` | Configura todo desde cero (lo corres una vez). |
| `npm run dev` | Arranca la app en modo desarrollo (uso normal). |
| `npm run build` | Prepara la versión optimizada para producción. |
| `npm run start` | Arranca la versión de producción. |
| `npm run db:studio` | Abre un panel visual para inspeccionar la base de datos. |

---

## Tecnologías

Next.js 15, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL) y Drizzle ORM.
