import { createVitestConfig } from "../../config/vitest/config.ts";

export default createVitestConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
  },
});
