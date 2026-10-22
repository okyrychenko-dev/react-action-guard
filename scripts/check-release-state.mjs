import { fileURLToPath } from "node:url";
import { syncReleaseState } from "./release/state.utils.mjs";

syncReleaseState(fileURLToPath(new URL("../", import.meta.url)), {
  check: !process.argv.includes("--write"),
});
