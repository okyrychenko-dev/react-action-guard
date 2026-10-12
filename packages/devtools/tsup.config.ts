import { createTsupConfig } from "../../config/tsup/config";

export default createTsupConfig({
  entry: ["src/index.ts"],
  // tsup forwards the .css loader through its PostCSS onLoad hook.
  loader: { ".css": "local-css" },
  external: ["react", "zustand", "@okyrychenko-dev/react-action-guard"],
});
