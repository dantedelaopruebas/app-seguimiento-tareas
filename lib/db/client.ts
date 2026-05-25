import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL. Revisa el archivo .env con la conexión a Supabase."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
}

// Cliente postgres-js. Con el pooler de Supabase en modo transacción
// (puerto 6543) hay que desactivar prepared statements.
// En serverless (Vercel) usamos max:1 para no saturar el pooler con
// múltiples conexiones por cada función fría que arranca.
const isServerless = !!process.env.VERCEL;
const client =
  global.__pg ??
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: isServerless ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") global.__pg = client;

export const db = drizzle(client, { schema });
