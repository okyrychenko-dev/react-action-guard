import { createTsupConfig } from "../../config/tsup/config";

export default createTsupConfig({
  entry: ["src/index.ts"],
  external: ["@okyrychenko-dev/react-action-guard", "react"],
});
