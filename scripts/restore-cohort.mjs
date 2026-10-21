import { resolve } from "node:path";
import { restorePackageBuilds } from "./compatibility/cohort.utils.mjs";

const artifact = process.env.ACTION_GUARD_COHORT;
if (!artifact) throw new Error("ACTION_GUARD_COHORT is required; refusing an implicit rebuild");
restorePackageBuilds(process.cwd(), resolve(artifact));
