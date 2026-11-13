// Shared helpers for the Bare Video scripts. Node 22+, no dependencies.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function die(msg) {
  console.error("ERROR: " + msg);
  process.exit(1);
}

// Tiny argv parser: positional args plus --key value / --flag.
export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

export function run(cmd, list, opts = {}) {
  const r = spawnSync(cmd, list, { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  if (r.error) die(`${cmd} could not start: ${r.error.message}. Is it installed and on PATH?`);
  return r;
}

export function ffmpeg(list, what) {
  const r = run("ffmpeg", ["-hide_banner", "-y", ...list]);
  if (r.status !== 0) die(`ffmpeg failed while ${what}:\n${(r.stderr || "").split("\n").slice(-12).join("\n")}`);
  return r;
}

export function probe(file) {
  if (!fs.existsSync(file)) die(`file not found: ${file}`);
  const r = run("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]);
  if (r.status !== 0) die(`ffprobe could not read ${file}`);
  const j = JSON.parse(r.stdout);
  const v = j.streams.find(s => s.codec_type === "video");
  const a = j.streams.find(s => s.codec_type === "audio");
  let w = v ? +v.width : 0, h = v ? +v.height : 0;
  // phones store portrait video as landscape plus a rotation; report what the viewer sees
  const rot = v ? Math.abs(+(v.side_data_list?.find(d => d.rotation !== undefined)?.rotation ?? v.tags?.rotate ?? 0)) : 0;
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  return { duration: +j.format.duration, width: w, height: h, hasVideo: !!v, hasAudio: !!a, fps: v ? v.avg_frame_rate : null };
}

export function readJSON(file) {
  if (!fs.existsSync(file)) die(`file not found: ${file}`);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { die(`${file} is not valid JSON: ${e.message}`); }
}

export function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 1) + "\n");
}

// Words are always [{w, s, e}] in seconds. words.txt is the human/model-readable view:
// "index  start  end  word", one per line.
export function writeWords(base, words) {
  writeJSON(base + ".json", words);
  const lines = words.map((x, i) => `${String(i).padStart(4)}  ${x.s.toFixed(2).padStart(7)}  ${x.e.toFixed(2).padStart(7)}  ${x.w}`);
  fs.writeFileSync(base + ".txt", "# index  start  end  word   (seconds)\n" + lines.join("\n") + "\n");
  fs.writeFileSync(base.replace(/words$/, "lines") + ".txt", linesText(words));
}

// One sentence or breath per line, with the word index range a cut list can refer to.
// "[12-30]  4.10s  (+0.8s pause)  text"
export function sentenceLines(words) {
  const out = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    const next = words[i + 1];
    const gap = next ? next.s - w.e : 0;
    if (!next || /[.?!]["')\]]?$/.test(w.w) || gap > 0.7 || cur.length >= 28) {
      out.push({ from: cur[0], to: i, s: words[cur[0]].s, e: w.e, pause: gap, text: cur.map(k => words[k].w).join(" ") });
      cur = [];
    }
  });
  return out;
}

export function linesText(words) {
  const rows = sentenceLines(words).map((l, n) =>
    `L${String(n + 1).padEnd(4)} [${l.from}-${l.to}]`.padEnd(18) + `${l.s.toFixed(1).padStart(6)}s  ${l.text}` + (l.pause > 0.7 ? `   (pause ${l.pause.toFixed(1)}s)` : ""));
  return "# One line per sentence. [first-last] are word indexes for cuts.json. Times are seconds.\n" + rows.join("\n") + "\n";
}

// Load KEY from the environment, else from the nearest .env in cwd or its parents. Never prints the value.
export function secret(key) {
  if (process.env[key]) return process.env[key];
  let dir = process.cwd();
  for (;;) {
    const f = path.join(dir, ".env");
    if (fs.existsSync(f)) {
      const m = fs.readFileSync(f, "utf8").match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`, "m"));
      if (m && m[1].replace(/^["']|["']$/g, "").trim()) return m[1].replace(/^["']|["']$/g, "").trim();
    }
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// Normalise a word for matching: lowercase, letters and digits only.
export const norm = s => String(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]/gu, "");

export const fmt = t => (Math.round(t * 100) / 100).toFixed(2);
