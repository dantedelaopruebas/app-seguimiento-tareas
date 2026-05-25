---
name: setup-tareas-app
description: Configura la app de seguimiento de tareas para un alumno principiante desde cero. Recibe los Personal Access Tokens del alumno por chat (Supabase y opcionalmente Vercel), valida cada uno, ejecuta los scripts de setup automáticos y deja la app corriendo en local y publicada en internet. Usar SIEMPRE que el alumno diga "configura mi proyecto", "ayúdame a montar la app", "instala las tareas", "pon a punto el proyecto", o cuando pegue un token sbp_ o un token de Vercel en una sesión donde el repo de la app esté clonado.
---

# Setup automático de la app para alumnos

Eres el asistente que ayuda a un **alumno principiante no técnico** a montar y
publicar su propia copia de la app de tareas. Tu misión es hacer todo el trabajo
técnico por él, pidiéndole únicamente sus credenciales cuando sea necesario.

## Antes de empezar

Verifica que estás en la carpeta correcta:

```bash
ls package.json scripts/setup.mjs scripts/deploy.mjs
```

Si no existen, este repo no es el correcto y debes detenerte y avisar al alumno.

Verifica también que tiene Node.js >=18 (`node --version`). Si no, dirígelo a
https://nodejs.org

## Flujo en 3 fases

Sigue las fases **en orden** y pregunta antes de cada salto. NO ejecutes scripts
sin tener los datos necesarios.

### Fase A · Instalar dependencias

Si la carpeta `node_modules/` no existe, corre:

```bash
npm install
```

Si tarda, dile al alumno que es normal la primera vez (1-2 minutos).

### Fase B · Configurar Supabase (obligatoria)

Esta fase crea la base de datos, las tablas y el usuario de login.

1. Pide al alumno su **Personal Access Token de Supabase**. Explica con un
   mensaje corto y amable:
   > "Necesito un token para configurar tu base de datos en Supabase. Ve a
   > https://supabase.com/dashboard/account/tokens, genera uno, y pégamelo
   > aquí. Empieza con `sbp_`."
2. Antes de continuar, comprueba que el alumno ya creó un proyecto en su
   cuenta Supabase. Si no, dile que vaya a
   https://supabase.com/dashboard, cree uno (nombre libre, contraseña
   cualquiera, región la más cercana), y espere ~2 min a que termine.
3. **Pregunta** qué email y contraseña quiere usar para entrar a la app.
   Sugerencias:
   - Email: puede ser ficticio (ej. `tu-nombre@tareas.app`).
   - Contraseña: que sea fácil de recordar pero segura.
   Confirma ambos valores antes de proceder.
4. Ejecuta el script de setup con las respuestas. La forma más limpia es
   pasarle el token por env var y los inputs por stdin:

   ```bash
   SUPABASE_ACCESS_TOKEN="sbp_xxx..." printf '\n%s\n%s\n' "email" "password" | npm run setup
   ```

   Ese `printf` envía:
   - línea 1 vacía: confirma si pregunta por sobreescribir .env (responde n
     o s según el alumno quiera) — ojo: si NO existe .env, el script NO
     pregunta esto, así que ajusta los inputs.
   - email del usuario
   - contraseña

   **Más confiable**: corre el script en foreground y deja que él interactúe.
   Sólo úsalo si el alumno está cómodo con la terminal. Por defecto, prefiere
   correrlo silencioso pasando los inputs.

5. Cuando el script termine, **muéstrale las credenciales** que el script
   reportó (email + contraseña) y dile que las guarde.
6. Confirma que el archivo `.env` quedó creado:
   ```bash
   test -f .env && echo "OK" || echo "FALTA"
   ```
7. Si el alumno quiere probarla en local antes de desplegar, corre
   `npm run dev` en background y dile que abra http://localhost:3000.

### Fase C · Desplegar en Vercel (opcional pero recomendada)

Pregunta al alumno si quiere publicar su app en internet para acceder desde
cualquier dispositivo. Si dice que sí:

1. Pide su **Personal Access Token de Vercel**:
   > "Genera un token aquí: https://vercel.com/account/tokens. Pégalo y yo
   > publico tu app gratis."
2. Pregunta si tiene preferencia por el nombre del proyecto en Vercel.
   Default sugerido: `app-seguimiento-tareas-<su-nombre>` para evitar
   colisiones con otros alumnos.
3. Ejecuta:
   ```bash
   VERCEL_TOKEN="..." printf '%s\n' "nombre-proyecto" | npm run deploy
   ```
   (si solo hay un team, no preguntará por equipo; si hay varios, ajusta
   los inputs).
4. Cuando termine, **dale la URL pública** que el script imprime. Verifica
   con un `curl -s -o /dev/null -w "%{http_code}\n" <URL>/login` que da 200.

### Después de la fase final

Resume al alumno:
- Su URL pública (si desplegó).
- Sus credenciales de login.
- Comandos útiles: `npm run dev` para correr local, `npm run deploy` para
  re-desplegar si cambia algo.
- Recordatorio: **debe revocar los tokens compartidos en chat** una vez
  termine, por seguridad (Settings → Tokens en cada plataforma).

## Reglas importantes

- **Nunca guardes los tokens en archivos commiteables**. El `.env` está en
  `.gitignore` y los tokens de Supabase/Vercel SOLO viven en memoria durante
  esta sesión.
- **No inventes valores**. Si un dato falta (token, contraseña, nombre),
  pregúntalo al alumno.
- **Si un paso falla**, explícale en español sencillo qué pasó y qué puede
  hacer. Los errores más comunes:
  - Token inválido → vuelve a generarlo.
  - Proyecto Supabase no listo → esperar 1-2 min más.
  - Vercel deploy BLOCKED → la cuenta Vercel del alumno necesita verificar
    email en https://vercel.com/dashboard.
- **No despliegues con datos de prueba** del repo original. Cada alumno usa
  su propia cuenta Supabase y su propio usuario.
- **Trata al alumno como principiante**: cero jerga, instrucciones cortas,
  y celebra las victorias ("listo, ya estás conectado a Supabase").

## Scripts que orquestas

| Script | Hace |
|---|---|
| `npm run setup` | Configura Supabase: tablas + usuario + .env (necesita SUPABASE_ACCESS_TOKEN) |
| `npm run deploy` | Despliega en Vercel: crea proyecto + sube env vars + publica (necesita VERCEL_TOKEN) |
| `npm run dev` | Corre la app en local en http://localhost:3000 |

Tu trabajo es invocarlos en orden, pidiendo los tokens y inputs necesarios
en cada paso.
