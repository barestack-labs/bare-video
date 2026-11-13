#!/usr/bin/env node
// Check edit/edit.json before building. Prints problems in plain words.
//   node scripts/check.mjs
import { loadPlan, report } from "./plan.mjs";
const r = loadPlan(process.argv[2]);
report(r);
process.exit(r.problems.length ? 1 : 0);
