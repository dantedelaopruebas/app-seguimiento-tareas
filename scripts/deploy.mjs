#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
//   Deploy a Vercel (producción) usando solo el Vercel Access Token.
//   Crea el proyecto, sube las variables de entorno, despliega y deja
//   la URL pública lista. NO requiere instalar Vercel CLI globalmente
//   — usa npx.
//
//   Requisitos:  haber corrido antes `npm run setup` (necesita .env).
//   Uso:         npm run deploy
// ════════════════════════════════════════════════════════════════════

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile, access, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const API = "https://api.vercel.com";

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
  const r = await fetch(API + path, {
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
    const msg = (data && (data.error?.message || data.message)) || text;
    throw new Error(`${method} ${path} → ${r.status}: ${msg}`);
  }
  return data;
}

/** Spawn que reenvía stdout/stderr en vivo para builds largos */
function spawnLive(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      env: { ...process.env, ...env, FORCE_COLOR: "1" },
    });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} salió con código ${code}`));
    });
  });
}

function parseEnvFile(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2];
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    out.push({ key: m[1], value });
  }
  return out;
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  console.log("\n" + color("bold", "Deploy a Vercel · App de tareas"));
  console.log(color("gray", "─".repeat(50)));

  // ── 0. Pre-requisitos ───────────────────────────────────────────────
  if (!(await fileExists(".env"))) {
    log.err('No encuentro un archivo .env. Corre primero "npm run setup".');
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  const ask = (q) => rl.question(q);

  // ── 1. Token Vercel ─────────────────────────────────────────────────
  log.step("Paso 1/5: Personal Access Token de Vercel");
  console.log(color("gray", "Genera uno en: https://vercel.com/account/tokens"));
  let token = (process.env.VERCEL_TOKEN ?? "").trim();
  if (!token) token = (await ask("Pega tu token: ")).trim();
  if (!token) { log.err("Token vacío."); rl.close(); process.exit(1); }

  log.info("Verificando token...");
  const me = await api(token, "GET", "/v2/user");
  log.ok(`Autenticado como: ${color("bold", me.user?.username ?? me.user?.email ?? "(?)")}`);

  // ── 2. Equipo o cuenta personal ─────────────────────────────────────
  const { teams } = await api(token, "GET", "/v2/teams");
  let teamId = null;
  if (teams.length === 1) {
    teamId = teams[0].id;
    log.info(`Equipo: ${teams[0].name}`);
  } else if (teams.length > 1) {
    console.log("\nTus equipos:");
    teams.forEach((t, i) => console.log(`  ${i + 1}. ${t.name}`));
    const choice = parseInt((await ask("¿Cuál usar? (número): ")).trim(), 10);
    teamId = teams[choice - 1]?.id;
    if (!teamId) { log.err("Opción inválida."); rl.close(); process.exit(1); }
  }
  const qs = teamId ? `?teamId=${teamId}` : "";

  // ── 3. Nombre del proyecto + crearlo ────────────────────────────────
  log.step("Paso 2/5: nombre del proyecto en Vercel");
  const defaultName = "app-seguimiento-tareas";
  const inputName = (await ask(`Nombre (Enter para "${defaultName}"): `)).trim();
  const projectName = inputName || defaultName;

  let project;
  try {
    project = await api(token, "POST", "/v11/projects" + qs, {
      name: projectName,
      framework: "nextjs",
    });
    log.ok(`Proyecto "${projectName}" creado.`);
  } catch (e) {
    if (/already exists|conflict/i.test(e.message)) {
      log.warn(`El proyecto "${projectName}" ya existe, lo reuso.`);
      const list = await api(token, "GET", `/v9/projects${qs}${qs ? "&" : "?"}search=${encodeURIComponent(projectName)}`);
      project = (list.projects || []).find((p) => p.name === projectName);
      if (!project) throw new Error("No pude encontrar el proyecto existente.");
    } else throw e;
  }

  // ── 4. Variables de entorno ─────────────────────────────────────────
  log.step("Paso 3/5: cargar variables de entorno");
  const envText = await readFile(".env", "utf8");
  const vars = parseEnvFile(envText).filter((v) => v.value);
  log.info(`Encontré ${vars.length} variable(s) en .env`);

  for (const { key, value } of vars) {
    try {
      await api(token, "POST", `/v10/projects/${project.id}/env${qs}`, {
        key,
        value,
        target: ["production", "preview", "development"],
        type: "encrypted",
      });
      log.ok(`${key}`);
    } catch (e) {
      if (/already exists|ENV_CONFLICT/i.test(e.message)) {
        log.warn(`${key} ya existía (saltado)`);
      } else {
        throw e;
      }
    }
  }

  // ── 5. Link local sin CLI: escribimos .vercel/project.json ─────────
  log.step("Paso 4/5: vincular carpeta local");
  await mkdir(".vercel", { recursive: true });
  await writeFile(
    ".vercel/project.json",
    JSON.stringify({ projectId: project.id, orgId: teamId ?? project.accountId }, null, 2)
  );
  log.ok("Vinculado.");

  // ── 6. Deploy ───────────────────────────────────────────────────────
  log.step("Paso 5/5: desplegar (puede tardar 1-2 min, vas a ver el progreso)");
  await spawnLive("npx", ["--yes", "vercel@latest", "deploy", "--prod", "--yes"], {
    VERCEL_TOKEN: token,
  });

  // ── 7. Quitar Deployment Protection (URL pública) ──────────────────
  log.info("Desactivando protección de despliegue (URL pública)...");
  try {
    await api(token, "PATCH", `/v9/projects/${project.id}${qs}`, { ssoProtection: null });
    log.ok("Protección desactivada.");
  } catch (e) {
    log.warn(`No pude desactivarla: ${e.message}. Hazlo manual en el dashboard si lo necesitas.`);
  }

  // ── 8. Obtener URL del último deploy ───────────────────────────────
  let publicUrl = null;
  try {
    const aliasQs = teamId ? `?teamId=${teamId}&limit=5` : "?limit=5";
    const aliases = await api(token, "GET", `/v9/projects/${project.id}/aliases${aliasQs}`);
    const a = (aliases.aliases ?? []).find((x) => !/-[a-z0-9]+\./.test(x.alias)) ?? aliases.aliases?.[0];
    if (a) publicUrl = `https://${a.alias}`;
  } catch { /* fallback below */ }

  if (!publicUrl) {
    const deps = await api(token, "GET",
      `/v6/deployments?projectId=${project.id}&target=production&limit=1${teamId ? "&teamId=" + teamId : ""}`);
    const url = deps.deployments?.[0]?.url;
    if (url) publicUrl = `https://${url}`;
  }

  // ── Resumen ─────────────────────────────────────────────────────────
  console.log("\n" + color("green", "─".repeat(50)));
  console.log(color("bold", "  ✓ ¡Tu app está en internet!"));
  console.log(color("green", "─".repeat(50)));
  console.log();
  if (publicUrl) console.log("URL pública: " + color("cyan", publicUrl));
  else            console.log(color("yellow", "Revisa la URL en https://vercel.com/dashboard"));
  console.log();
  console.log("Entra con el email y contraseña que el script setup.mjs te dio.");
  console.log();

  rl.close();
}

main().catch((e) => {
  console.error();
  log.err(e.message);
  process.exit(1);
});
