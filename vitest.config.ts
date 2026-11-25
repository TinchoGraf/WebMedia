import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@config": fileURLToPath(new URL("./client.config.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integracion/**/*.test.ts"],
    // Los de integración comparten la base de test: uno por vez
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
