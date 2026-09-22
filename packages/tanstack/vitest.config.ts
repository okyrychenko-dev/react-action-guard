import { createVitestConfig } from "../../config/vitest/config.ts";

export default createVitestConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/index.ts"],
    },
  },
});
