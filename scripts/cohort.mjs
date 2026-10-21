import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { preparePackedCohort, restorePackageBuilds } from "./compatibility/cohort.utils.mjs";

const [command, destination] = process.argv.slice(2);
switch (command) {
  case "prepare": {
    if (!destination) throw new Error("Usage: cohort:prepare <empty artifact directory>");
    if (existsSync(destination) && readdirSync(destination).length)
      throw new Error("Cohort destination must be empty");
    execFileSync("pnpm", ["run", "build:packages"], { stdio: "inherit" });
    preparePackedCohort(process.cwd(), resolve(destination));
    break;
  }
  case "restore": {
    const artifact = process.env.ACTION_GUARD_COHORT;
    if (!artifact) throw new Error("ACTION_GUARD_COHORT is required; refusing an implicit rebuild");
    restorePackageBuilds(process.cwd(), resolve(artifact));
    break;
  }
  default:
    throw new Error("Usage: node scripts/cohort.mjs <prepare|restore>");
}
