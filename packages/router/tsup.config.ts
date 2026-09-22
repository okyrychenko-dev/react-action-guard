import { createTsupConfig } from "../../config/tsup/config";

export default createTsupConfig({
  entry: {
    index: "src/index.ts",
    "react-router/index": "src/react-router/index.ts",
    "tanstack-router/index": "src/tanstack-router/index.ts",
    "nextjs/index": "src/nextjs/index.ts",
  },
  external: [
    "react",
    "react-dom",
    "react-router-dom",
    "@tanstack/react-router",
    "next",
    "@okyrychenko-dev/react-action-guard",
    "zustand",
  ],
});
