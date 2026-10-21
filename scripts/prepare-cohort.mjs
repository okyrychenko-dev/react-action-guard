import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { preparePackedCohort } from "./compatibility/cohort.utils.mjs";

const destination = process.argv[2];
if (!destination) throw new Error("Usage: cohort:prepare <empty artifact directory>");
if (existsSync(destination) && readdirSync(destination).length)
  throw new Error("Cohort destination must be empty");
execFileSync("pnpm", ["run", "build:packages"], { stdio: "inherit" });
preparePackedCohort(process.cwd(), resolve(destination));
