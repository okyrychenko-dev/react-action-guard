import { createTsupConfig } from "../../config/tsup/config";

export default createTsupConfig({
  entry: ["src/index.ts"],
  external: ["react", "@tanstack/react-query", "@okyrychenko-dev/react-action-guard"],
});
