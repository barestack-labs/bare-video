#!/usr/bin/env node
// Turn edit/edit.json into a HyperFrames project in work/ (index.html plus the template files).
//   node scripts/build.mjs
// Then: npx hyperframes preview work   |   npx hyperframes render work --output work/render.mp4
import fs from "node:fs";
import path from "node:path";
import { die, probe, SKILL_DIR } from "./lib.mjs";
import { loadPlan, report } from "./plan.mjs";

const r = loadPlan(process.argv[2]);
report(r);
if (r.problems.length) process.exit(1);
const V = r.data;
if (!fs.existsSync("work/cut.mp4")) die("work/cut.mp4 is missing. Run cut.mjs first.");

// template files, copied fresh every build (about 200 KB)
const T = path.join(SKILL_DIR, "template");
fs.rmSync("work/bv", { recursive: true, force: true });
fs.cpSync(T, "work/bv", { recursive: true, filter: f => !f.endsWith(".html") });

// GSAP: use the copy that ships inside HyperFrames so renders work offline, else the CDN
let gsap = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
  const vendor = path.join(dir, "node_modules/hyperframes/dist/vendor/npm");
  if (fs.existsSync(vendor)) {
    const g = fs.readdirSync(vendor).filter(n => n.startsWith("gsap@")).sort().pop();
    if (g) { fs.copyFileSync(path.join(vendor, g, "dist/gsap.min.js"), "work/bv/gsap.min.js"); gsap = "bv/gsap.min.js"; }
    break;
  }
  if (path.dirname(dir) === dir) break;
}

// media files are hard-linked into work/media (no extra disk space on the same drive), copied otherwise
fs.mkdirSync("work/media", { recursive: true });
const linked = new Map();
function bring(src) {
  if (linked.has(src)) return linked.get(src);
  const name = `${linked.size}-${path.basename(src).replace(/[^\w.-]/g, "_")}`;
  const dest = path.join("work/media", name);
  fs.rmSync(dest, { force: true });
  try { fs.linkSync(src, dest); } catch { fs.copyFileSync(src, dest); }
  linked.set(src, "media/" + name);
  return "media/" + name;
}
const isVideo = f => /\.(mp4|mov|webm|mkv|m4v)$/i.test(f);
const attr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

let mediaTags = "";
V.scenes.forEach((s, k) => {
  if (s.type !== "media") return;
  s.mediaId = "m" + k;
  const src = bring(s.src);
  const len = (s.end - s.t).toFixed(3);
  mediaTags += isVideo(s.src)
    ? `<video id="${s.mediaId}" class="clip" data-start="${s.t}" data-duration="${len}" data-media-start="${+s.from || 0}" muted playsinline src="${attr(src)}"></video>\n`
    : `<img id="${s.mediaId}" src="${attr(src)}" alt="">\n`;
});
let audioTags = "";
V.sfx.forEach((x, i) => {
  const len = Math.min(probe(x.src).duration, V.duration - x.t).toFixed(3);
  audioTags += `<audio id="sfx${i}" class="clip" data-start="${x.t.toFixed(3)}" data-duration="${len}" data-volume="${x.volume}" src="${attr(bring(x.src))}"></audio>\n`;
});
if (V.music) {
  const len = Math.min(probe(V.music.src).duration, V.duration).toFixed(3);
  audioTags += `<audio id="music" class="clip" data-start="0" data-duration="${len}" data-volume="${V.music.volume}" data-fade-out="1.5" src="${attr(bring(V.music.src))}"></audio>\n`;
}

const classes = [`t-${V.theme}`, `caps-${V.captions}`, V.highlight === "block" ? "cap-block" : "", ].filter(Boolean).join(" ");
const markBlock = V.highlight === "block" ? " mark-block" : "";
const json = JSON.stringify({ ...V, sfx: undefined, music: undefined }).replace(/</g, "\\u003c");
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1080">
<title>Bare Video</title>
<link rel="stylesheet" href="bv/themes.css">
<link rel="stylesheet" href="bv/bv.css">
</head>
<body>
<div id="root" class="${classes}${markBlock}" data-composition-id="bare-video" data-width="1080" data-height="1920" data-duration="${V.duration}"${V.accent ? ` style="--accent:${V.accent}"` : ""}>
<div id="cam"><div id="camv" style="width:${V.footage.width}px;height:${V.footage.height}px"><video id="voice" class="clip" data-start="0" data-duration="${V.duration}" data-has-audio="true" playsinline src="cut.mp4"></video></div></div>
<div id="seam"></div>
<div id="media">
${mediaTags}</div>
<div id="scenes"></div>
<div id="caps"></div>
${audioTags}<script src="${gsap}"></script>
<script>window.BV = ${json};
window.__timelines = window.__timelines || {};
window.__timelines["bare-video"] = gsap.timeline({ paused: true });</script>
<script src="bv/bv.js"></script>
</div>
</body>
</html>
`;
fs.writeFileSync("work/index.html", html);
console.log(`\nBuilt work/index.html (${V.theme}, captions ${V.captions}). Next:`);
const mids = V.scenes.filter(s => s.type !== "none").map(s => +(s.t + Math.min(s.end - s.t, 1.6 + (s.end - s.t) / 3)).toFixed(1));
const at = (mids.length ? mids : [1, V.duration / 2]).slice(0, 12).join(",");
console.log(`  look:    npx hyperframes snapshot work --at ${at} --no-end   (then open contact-sheet.jpg)`);
console.log("  preview: npx hyperframes preview work");
console.log("  render:  npx hyperframes render work --output work/render.mp4   (only after the user approves)");
