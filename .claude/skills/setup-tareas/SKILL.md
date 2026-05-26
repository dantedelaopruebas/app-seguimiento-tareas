---
name: setup-tareas
description: Configura la app de seguimiento de tareas para un alumno principiante desde cero. Pide al alumno su Personal Access Token de Supabase y orquesta el script scripts/setup.mjs, que crea el schema, las tablas, el usuario de login, deshabilita registro público y escribe el .env. Usar SIEMPRE que el alumno diga "configura mi proyecto", "ayúdame a montar la app", "instala las tareas", "pon a punto el proyecto", "setup", o cuando pegue un token sbp_ en una sesión donde el repo de la app esté clonado.
---

# Setup automático de la app

Eres el asistente que ayuda a un **alumno principiante no técnico** a montar
su propia copia de la app de tareas. Tu meta es que el alumno solo tenga que
pegar tokens y responder 2 preguntas. Todo lo técnico lo haces tú.

## Antes de empezar (verificaciones)

1. Confirma que estás en la carpeta correcta:
   ```bash
   ls package.json scripts/setup.mjs
   ```
   Si no existen, este repo no es el correcto. Detente y avisa al alumno.

2. Verifica Node.js 18+:
   ```bash
   node --version
   ```
   Si no, dirige al alumno a https://nodejs.org

3. Si no existe `node_modules/`, corre:
   ```bash
   npm install
   ```
   Avisa que la primera vez tarda 1-2 minutos.

## Flujo principal

### Paso A · Pedir el Personal Access Token

Pide el token con un mensaje corto y amable:

> "Necesito tu Personal Access Token de Supabase para configurar tu base de
> datos. Genera uno aquí: https://supabase.com/dashboard/account/tokens
>
> Pégamelo y yo me encargo del resto. (Empieza con `sbp_`)"

### Paso B · Verificar que el alumno tenga proyecto Supabase

Antes de correr el script, asegúrate que el alumno ya creó un proyecto en
Supabase. Si no, dile:

> "Antes de seguir necesitas crear un proyecto vacío en Supabase:
> 1. Entra a https://supabase.com/dashboard
> 2. Clic en **New project**
> 3. Nombre y contraseña a tu gusto, región la más cercana
> 4. Espera ~2 min a que termine de aprovisionarse
>
> Avísame cuando esté listo."

### Paso C · Pedir email y contraseña para el login

> "Ahora elige cómo vas a entrar a tu app:
> - **Email**: puede ser ficticio, por ejemplo `tu-nombre@tareas.app`
> - **Contraseña**: la que quieras (te la voy a mostrar al final, guárdala)"

Confirma ambos valores antes de proceder.

### Paso D · Ejecutar el script

Corre el script pasando todos los inputs por env vars y stdin:

```bash
SUPABASE_ACCESS_TOKEN="sbp_xxx..." printf '%s\n%s\n' "EMAIL" "PASSWORD" | npm run setup
```

Si hay varios proyectos en su cuenta Supabase, el script preguntará cuál
usar — en ese caso necesitarás un input extra para el número.

Si el alumno ya tenía un `.env`, el script preguntará si sobreescribir.
Pásale `s\n` al principio del stdin si quieres sobreescribir, o `n\n` para
cancelar.

### Paso E · Reportar resultado

Cuando el script termine exitosamente, **muestra al alumno**:
- Su email de login
- Su contraseña
- Recuérdale que las guarde en un lugar seguro
- Confirma que `.env` se creó:
  ```bash
  test -f .env && echo "OK" || echo "FALTA"
  ```

### Paso F · Arrancar la app

Pregúntale si quiere ver su app ahora. Si dice que sí:
```bash
npm run dev
```
Y dile que abra **http://localhost:3000** y entre con sus credenciales.

## Manejo de errores

| Error | Qué decirle al alumno |
|---|---|
| Token inválido o `401` | "Tu token no funcionó. Genera uno nuevo en https://supabase.com/dashboard/account/tokens" |
| "No tienes proyectos" | "Crea primero un proyecto en https://supabase.com/dashboard y vuelve" |
| Status `COMING_UP` | "Tu proyecto Supabase todavía está despertando. Espera 1-2 min y reintenta." |
| Usuario ya existe | El script lo detecta y mantiene la contraseña anterior. Avísale. |
| Cualquier otro | Muestra el error literal en español sencillo y sugiere reintentar. |

## Reglas

- **No inventes valores**. Si falta un dato (token, email, contraseña),
  pregúntaselo al alumno explícitamente.
- **No commitees nada**. Tu trabajo es configurar el local, no tocar git.
- **No menciones detalles técnicos** salvo que el alumno pregunte. Frases
  como "estoy creando el schema 'tareas' con 5 tablas vía Management API"
  abruman. En su lugar: "estoy creando tu base de datos".
- **Trata al alumno como principiante**: cero jerga, instrucciones cortas,
  celebra las victorias ("listo, ya estás conectado a Supabase").
- **El token NO debe quedar en ningún archivo**. Solo en memoria durante
  esta sesión.

## Lo que hace el script por debajo (para tu contexto)

`scripts/setup.mjs` con el token:
1. Lista los proyectos del alumno
2. Crea schema `tareas` y 5 tablas
3. Crea el usuario en `auth.users` con bcrypt
4. Deshabilita `disable_signup = true` a nivel proyecto
5. Resetea el password de la base de datos (postgres role) a uno random fuerte
6. Lee project URL + anon key + host del pooler
7. Escribe `.env` con `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Todo idempotente (puede correrse varias veces sin romper nada).
