import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 es un módulo nativo; Next debe servirlo externamente.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
