import { createTsupConfig } from "../../config/tsup/config";

export default createTsupConfig({
  entry: ["src/index.ts"],
  external: ["react", "zustand", "@okyrychenko-dev/react-action-guard"],
});
