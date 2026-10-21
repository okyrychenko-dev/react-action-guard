import assert from "node:assert/strict";
import { test } from "node:test";
import { assertVerification, assertReleaseContext, requiredJobs } from "./gate.utils.mjs";

test("should reject failure, cancellation, skipped and missing required verification before publication", () => {
  const jobs = Object.fromEntries(requiredJobs.map((id) => [id, { result: "success" }]));
  assert.doesNotThrow(() => assertVerification(jobs));
  for (const id of requiredJobs) {
    for (const result of ["failure", "cancelled", "skipped", undefined]) {
      const changed = { ...jobs, [id]: { result } };
      assert.throws(() => assertVerification(changed), /Required verification/);
    }
    const missing = { ...jobs };
    delete missing[id];
    assert.throws(() => assertVerification(missing), /Required verification/);
  }
});

test("should restrict publication to the exact verified main push", () => {
  const context = { event: "push", ref: "refs/heads/main", commit: "abc", verifiedCommit: "abc" };
  assert.doesNotThrow(() => assertReleaseContext(context));
  for (const change of [
    { event: "pull_request" },
    { ref: "refs/heads/feature" },
    { verifiedCommit: "def" },
    { commit: undefined },
  ]) {
    assert.throws(() => assertReleaseContext({ ...context, ...change }));
  }
});
