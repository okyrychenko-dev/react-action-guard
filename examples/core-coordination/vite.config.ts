import { fileURLToPath } from "node:url";
import { createVitestConfig } from "../../config/vitest/config.ts";

export default createVitestConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
    alias: {
      "@okyrychenko-dev/react-action-guard": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url)
      ),
    },
  },
});
