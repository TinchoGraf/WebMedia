import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;
/**
 * Los E2E levantan la app con una base propia que se resetea en cada corrida:
 *  - E2E_DATABASE_URL definida → ese Postgres (se BORRA)
 *  - si no → PGlite en .data/e2e-pglite
 */
const env = {
  PERFIL: "autos",
  DATABASE_URL: process.env.E2E_DATABASE_URL ?? "",
  PGLITE_DIR: ".data/e2e-pglite",
  MEDIA_DIR: ".data/e2e-media",
  BETTER_AUTH_SECRET: "solo-para-tests-e2e-0123456789abcdef",
  BETTER_AUTH_URL: `http://localhost:${PUERTO}`,
  SEED_DUENO_EMAIL: "dueno@demo.local",
  SEED_DUENO_PASSWORD: "e2e-dueno-clave-larga",
  SEED_EDITOR_PASSWORD: "e2e-editor-clave-larga",
  SEED_DEMO_PASSWORD: "e2e-demo-clave-larga",
  CRON_SECRET: "e2e-cron",
  BLOB_READ_WRITE_TOKEN: "",
  RESEND_API_KEY: "",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PUERTO}`, trace: "retain-on-failure" },
  webServer: {
    command: `npm run db:reset && npx next build && npx next start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env,
  },
  projects: [
    { name: "sesiones", testMatch: /sesiones\.setup\.ts/ },
    { name: "escritorio", use: { viewport: { width: 1366, height: 900 } }, dependencies: ["sesiones"] },
    { name: "movil", use: { ...devices["Pixel 7"] }, dependencies: ["sesiones"], testMatch: /publico\.spec\.ts/ },
  ],
});

export const CLAVES = { dueno: env.SEED_DUENO_PASSWORD, demo: env.SEED_DEMO_PASSWORD };
