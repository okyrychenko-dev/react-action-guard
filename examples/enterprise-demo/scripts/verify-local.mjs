import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const evidence = JSON.parse(
  readFileSync(new URL("../.cache/local-packages/evidence.json", import.meta.url))
);
for (const { name, version, path, sha256 } of evidence.artifacts) {
  const installedManifest = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.resolve(name)))
  );
  assert.equal(
    installedManifest.version,
    version,
    `${name}: run setup:local again; installed package differs from evaluated cohort`
  );
  assert.equal(
    createHash("sha256").update(readFileSync(path)).digest("hex"),
    sha256,
    `${name}: evaluated archive changed`
  );
}
const core = await import("@okyrychenko-dev/react-action-guard");
const router = await import("@okyrychenko-dev/react-action-guard-router");
const adapter = await import("@okyrychenko-dev/react-action-guard-router/react-router");
const tanstack = await import("@okyrychenko-dev/react-action-guard-tanstack");
const ui = await import("@okyrychenko-dev/react-action-guard-ui");
for (const entry of [
  core.useResolvedStoreApi,
  core.useResolvedValue,
  core.UIBlockingProvider,
  router.useDialogState,
  adapter.useNavigationBlocker,
  tanstack.useBlockingQuery,
  ui.useGuardedButton,
]) {
  assert.equal(typeof entry, "function");
}
console.log(`Supported public imports passed for the cohort from ${evidence.sourceCommit}`);
