import assert from "node:assert/strict";
import { isPlainObject, isString } from "@okyrychenko-dev/type-utils";

export const requiredJobs = [
  "prepare",
  "static",
  "types",
  "runtime",
  "documentation",
  "publication",
  "packed-compatibility",
  "next-runtime",
  "navigation",
];

export function assertVerification(jobs) {
  assert.ok(isPlainObject(jobs), "Required verification results missing");
  assert.deepEqual(
    Object.keys(jobs).sort(),
    [...requiredJobs].sort(),
    "Required verification job set mismatch"
  );
  for (const id of requiredJobs) {
    assert.ok(
      isPlainObject(jobs[id]) && jobs[id].result === "success",
      `Required verification did not succeed: ${id}`
    );
  }
}

export function assertReleaseContext({ event, ref, commit, verifiedCommit }) {
  assert.equal(event, "push", "Publication requires a push event");
  assert.equal(ref, "refs/heads/main", "Publication requires main");
  assert.ok(isString(commit) && commit.length > 0, "Missing source commit");
  assert.equal(commit, verifiedCommit, "Publication requires the exact verified commit");
}
