import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@app": path.resolve(rootDir, "src/app"),
      "@features": path.resolve(rootDir, "src/features"),
      "@pages": path.resolve(rootDir, "src/pages"),
      "@shared": path.resolve(rootDir, "src/shared"),
      "@test": path.resolve(rootDir, "src/test"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
