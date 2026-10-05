import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const entries = JSON.parse(await readFile(new URL("./entries.json", import.meta.url), "utf8"));

for (const { path, exports: names } of entries) {
  const esm = await import(path);
  const { createRequire } = await import("node:module");
  const cjs = createRequire(import.meta.url)(path);
  for (const name of names) {
    assert.equal(typeof esm[name], "function", `${path} ESM ${name}`);
    assert.equal(typeof cjs[name], "function", `${path} CJS ${name}`);
  }
}
