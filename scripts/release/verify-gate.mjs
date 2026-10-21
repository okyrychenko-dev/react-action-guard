import { appendFileSync } from "node:fs";
import { assertVerification } from "./gate.utils.mjs";
import { sourceCommit } from "../compatibility/cohort.utils.mjs";

assertVerification(JSON.parse(process.env.VERIFICATION_RESULTS ?? "null"));
const commit = sourceCommit(process.cwd());
if (commit !== process.env.GITHUB_SHA)
  throw new Error("Verification checkout differs from workflow commit");
appendFileSync(process.env.GITHUB_OUTPUT, `commit=${commit}\n`);
