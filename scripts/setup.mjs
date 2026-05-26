#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//   Setup automático del proyecto.
//   Configura tu propio Supabase desde cero usando solo tu Personal
//   Access Token. No abres dashboards, no pegas SQL en ningún lado.
//
//   Uso:   npm run setup
// ════════════════════════════════════════════════════════════════════

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile, access } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const API_BASE = "https://api.supabase.com/v1";

const SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS tareas;

CREATE TABLE IF NOT EXISTS tareas.projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  icon text NOT NULL DEFAULT 'Folder',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tareas.tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'none',
  due_date timestamptz,
  completed_at timestamptz,
  project_id text REFERENCES tareas.projects(id) ON DELETE SET NULL,
  parent_task_id text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tareas.tags (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#a3a3a3'
);

CREATE TABLE IF NOT EXISTS tareas.task_tags (
  task_id text NOT NULL REFERENCES tareas.tasks(id) ON DELETE CASCADE,
  tag_id text NOT NULL REFERENCES tareas.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE IF NOT EXISTS tareas.activity_log (
  id text PRIMARY KEY,
  task_id text,
  action text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tareas.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due    ON tareas.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tareas.tasks(status);
`.trim();

// ── helpers ───────────────────────────────────────────────────────────

function color(c, s) {
  const codes = { gray: 90, red: 31, green: 32, yellow: 33, blue: 34, cyan: 36, bold: 1 };
  return `\x1b[${codes[c]}m${s}\x1b[0m`;
}
const log = {
  info: (m) => console.log(color("cyan", "•"), m),
  ok:   (m) => console.log(color("green", "✓"), m),
  warn: (m) => console.log(color("yellow", "!"), m),
  err:  (m) => console.error(color("red", "✗"), m),
  step: (m) => console.log("\n" + color("bold", m)),
};

async function api(token, method, path, body) {
  const r = await fetch(API_BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) {
    const msg = (data && (data.message ?? JSON.stringify(data))) || text;
    throw new Error(`${method} ${path} → ${r.status}: ${msg}`);
  }
  return data;
}

const runSQL = (token, ref, sql) =>
  api(token, "POST", `/projects/${ref}/database/query`, { query: sql });

const esc = (s) => String(s).replace(/'/g, "''");

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// ── main ──────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + color("bold", "Setup del proyecto · App de tareas"));
  console.log(color("gray", "─".repeat(50)));

  const rl = readline.createInterface({ input, output });
  const ask = (q) => rl.question(q);

  if (await fileExists(".env")) {
    console.log();
    log.warn("Ya existe un archivo .env. Si continúas se sobreescribirá.");
    const ok = (await ask("¿Continuar? (s/N): ")).trim().toLowerCase();
    if (ok !== "s" && ok !== "si" && ok !== "sí" && ok !== "y") {
      log.info("Cancelado.");
      rl.close();
      return;
    }
  }

  // ── 1. Token ────────────────────────────────────────────────────────
  log.step("Paso 1/6: Personal Access Token de Supabase");
  console.log(color("gray", "Genera uno en: https://supabase.com/dashboard/account/tokens"));
  let token = (process.env.SUPABASE_ACCESS_TOKEN ?? "").trim();
  if (!token) token = (await ask("Pega tu token (empieza con sbp_): ")).trim();
  if (!token.startsWith("sbp_")) {
    log.err('El token debe empezar con "sbp_". Vuelve a generarlo.');
    rl.close();
    process.exit(1);
  }

  // ── 2. Elegir proyecto ──────────────────────────────────────────────
  log.step("Paso 2/6: elegir proyecto Supabase");
  log.info("Consultando tu cuenta…");
  const projects = await api(token, "GET", "/projects");
  if (!projects.length) {
    log.err("No tienes proyectos en Supabase. Crea uno en https://supabase.com/dashboard y vuelve a correr este script.");
    rl.close();
    process.exit(1);
  }
  let project;
  if (projects.length === 1) {
    project = projects[0];
    log.ok(`Único proyecto: ${color("bold", project.name)} (${project.region})`);
  } else {
    console.log("\nTus proyectos:");
    projects.forEach((p, i) =>
      console.log(`  ${i + 1}. ${p.name}   ${color("gray", `· ${p.region} · ${p.status}`)}`)
    );
    const choice = parseInt((await ask("¿Cuál usar? (número): ")).trim(), 10);
    if (!Number.isFinite(choice) || choice < 1 || choice > projects.length) {
      log.err("Opción inválida.");
      rl.close();
      process.exit(1);
    }
    project = projects[choice - 1];
  }
  if (project.status !== "ACTIVE_HEALTHY") {
    log.warn(`Proyecto en estado "${project.status}". Si algo falla, espera 1-2 min y reintenta.`);
  }
  const ref = project.ref;

  // ── 3. Tablas ───────────────────────────────────────────────────────
  log.step("Paso 3/6: crear schema 'tareas' y tablas");
  await runSQL(token, ref, SCHEMA_SQL);
  log.ok("Schema y 5 tablas creadas (o ya existían).");

  // ── 4. Usuario de login ─────────────────────────────────────────────
  log.step("Paso 4/6: crear tu usuario de login");
  const emailInput = (await ask("Email (puede ser ficticio, ej. tu@tareas.app): ")).trim();
  const email = emailInput || "tu@tareas.app";
  let password = (await ask("Contraseña (vacío para generar una): ")).trim();
  if (!password) {
    password = `Tareas${new Date().getFullYear()}!`;
    log.info(`Contraseña generada: ${color("bold", password)}`);
  }

  const existing = await runSQL(
    token, ref,
    `SELECT id FROM auth.users WHERE email = '${esc(email)}' LIMIT 1;`
  );
  if (Array.isArray(existing) && existing.length > 0) {
    log.warn(`El usuario "${email}" ya existe. Mantengo su contraseña anterior.`);
  } else {
    await runSQL(token, ref, `
      WITH new_user AS (
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at, confirmation_token, recovery_token,
          email_change_token_new, email_change
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          '${esc(email)}',
          crypt('${esc(password)}', gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          now(), now(), '', '', '', ''
        )
        RETURNING id, email
      )
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      )
      SELECT
        gen_random_uuid(), new_user.id,
        jsonb_build_object('sub', new_user.id::text, 'email', new_user.email),
        'email', new_user.id::text, now(), now(), now()
      FROM new_user;
    `);
    log.ok(`Usuario "${email}" creado.`);
  }

  // ── 5. Blindar Auth + DB password ───────────────────────────────────
  log.step("Paso 5/6: blindar y obtener credenciales");
  log.info("Deshabilitando registro público…");
  await api(token, "PATCH", `/projects/${ref}/config/auth`, { disable_signup: true });
  log.ok("Registro público deshabilitado.");

  log.info("Reseteando contraseña de la base de datos a una segura…");
  const dbPassword = randomBytes(18).toString("hex");
  await runSQL(token, ref, `ALTER USER postgres WITH PASSWORD '${esc(dbPassword)}';`);
  log.ok("Contraseña regenerada (la guardo en .env).");

  log.info("Obteniendo URL, anon key y datos del pooler…");
  const supabaseUrl = `https://${ref}.supabase.co`;
  const keysResp = await api(token, "GET", `/projects/${ref}/api-keys`);
  const anonKey = (Array.isArray(keysResp) ? keysResp : keysResp?.keys ?? [])
    .find((k) => k.name === "anon" || k.id === "anon")?.api_key;
  if (!anonKey) throw new Error("No pude obtener el anon key del proyecto.");

  const pooler = await api(token, "GET", `/projects/${ref}/config/database/pooler`);
  const dbHost = (Array.isArray(pooler) ? pooler[0] : pooler)?.db_host;
  if (!dbHost) throw new Error("No pude obtener el host del pooler.");

  // ── 6. Escribir .env ────────────────────────────────────────────────
  log.step("Paso 6/6: escribir .env");
  const envContent = `# Generado por scripts/setup.mjs · ${new Date().toISOString()}
# Este archivo NO se sube a GitHub (está en .gitignore).
DATABASE_URL="postgresql://postgres.${ref}:${dbPassword}@${dbHost}:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"
`;
  await writeFile(".env", envContent, "utf8");
  log.ok(".env creado.");

  // ── Resumen ─────────────────────────────────────────────────────────
  console.log("\n" + color("green", "─".repeat(50)));
  console.log(color("bold", "  ✓ ¡Listo! Tu proyecto está configurado."));
  console.log(color("green", "─".repeat(50)));
  console.log();
  console.log(`Proyecto Supabase:  ${color("bold", project.name)}`);
  console.log();
  console.log(color("bold", "Tus credenciales para entrar a la app:"));
  console.log(`  Email:       ${color("bold", email)}`);
  console.log(`  Contraseña:  ${color("bold", password)}`);
  console.log();
  console.log(color("yellow", "  ⚠  Guarda estos datos en un lugar seguro."));
  console.log();
  console.log("Siguiente paso:");
  console.log(color("bold", "  npm run dev"));
  console.log("Luego abre " + color("cyan", "http://localhost:3000"));
  console.log();

  rl.close();
}

main().catch((e) => {
  console.error();
  log.err(e.message);
  process.exit(1);
});
