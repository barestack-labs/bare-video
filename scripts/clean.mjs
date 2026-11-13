#!/usr/bin/env node
// Free disk space after the final video exists. Lists first; deletes only with --yes.
//   node scripts/clean.mjs          (shows what would go)
//   node scripts/clean.mjs --yes    (deletes it)
// Removes work/ (cut video, render, build, snapshots). Keeps edit/ (small text files that can rebuild
// the edit), the source video, assets/ and final.mp4. Never touches anything else.
import fs from "node:fs";
import path from "node:path";
import { args } from "./lib.mjs";

const a = args();
const size = p => {
  if (!fs.existsSync(p)) return 0;
  const s = fs.statSync(p);
  if (!s.isDirectory()) return s.nlink > 1 ? 0 : s.size; // hard links share bytes with the original
  return fs.readdirSync(p).reduce((n, f) => n + size(path.join(p, f)), 0);
};
const targets = ["work", ".hyperframes", "renders", "snapshots"].filter(p => fs.existsSync(p));
const total = targets.reduce((n, p) => n + size(p), 0);
if (!targets.length) { console.log("Nothing to clean."); process.exit(0); }
console.log(`Would remove ${targets.join(", ")}: ${(total / 1e6).toFixed(0)} MB.`);
console.log("Kept: edit/ (text), your source video, assets/, final.mp4.");
if (!fs.existsSync(a.final || "final.mp4") && !a.force) {
  console.log("Stopped: final.mp4 does not exist yet, so the work folder is still needed. Use --force to remove it anyway.");
  process.exit(1);
}
if (!a.yes) { console.log("Run again with --yes to delete."); process.exit(0); }
targets.forEach(p => fs.rmSync(p, { recursive: true, force: true }));
console.log(`Removed ${(total / 1e6).toFixed(0)} MB. To change the edit later, run cut.mjs and build.mjs again from edit/.`);
