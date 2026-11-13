#!/usr/bin/env node
// Cut the talking-head video from a keep list, tighten pauses, remap the word timings.
//
//   node scripts/cut.mjs <video> [edit/cuts.json]
//
// edit/cuts.json:
//   { "keep": ["L1", "L3-L5", "120-164"], "pause": 0.15 }
//   "L3" is a line from edit/lines.txt, "L3-L5" a run of lines, "120-164" a word index range from edit/words.txt.
//   Entries play in the order written. "pause" is the longest silence left inside kept speech (seconds).
//
// Writes work/cut.mp4 (the edited voice track and picture), edit/cut.words.*, edit/cut.lines.txt, edit/cut.map.json.
import fs from "node:fs";
import { args, die, ffmpeg, probe, readJSON, writeJSON, writeWords, sentenceLines, run, fmt } from "./lib.mjs";

const a = args();
const video = a._[0];
const cutsFile = a._[1] || "edit/cuts.json";
if (!video) die("usage: node scripts/cut.mjs <video> [edit/cuts.json]");
const info = probe(video);
const words = readJSON("edit/words.json");
const lines = sentenceLines(words);
const cuts = readJSON(cutsFile);
if (!Array.isArray(cuts.keep) || !cuts.keep.length) die(`${cutsFile} needs a "keep" list, for example {"keep": ["L1", "L3-L5"]}`);
const PAUSE = Math.min(0.6, Math.max(0.05, +cuts.pause || 0.15));
const PAD = 0.06;
const TAIL = 1.2; // hold the last frame so the final words land before the video ends

// 1. keep entries -> word index ranges
const ranges = cuts.keep.map(k => {
  const s = String(k).trim().toUpperCase();
  let m;
  if ((m = s.match(/^L(\d+)(?:\s*-\s*L?(\d+))?$/))) {
    const A = lines[+m[1] - 1], B = lines[+(m[2] || m[1]) - 1];
    if (!A || !B) die(`"${k}" is not a line in edit/lines.txt (there are ${lines.length} lines).`);
    return [A.from, B.to];
  }
  if ((m = s.match(/^(\d+)\s*-\s*(\d+)$/))) {
    const x = +m[1], y = +m[2];
    if (!words[x] || !words[y] || y < x) die(`"${k}" is not a valid word range (0-${words.length - 1}).`);
    return [x, y];
  }
  die(`cannot read keep entry "${k}". Use "L3", "L3-L5" or "120-164".`);
});
// merge ranges that continue each other
const merged = [];
for (const r of ranges) {
  const last = merged[merged.length - 1];
  if (last && r[0] === last[1] + 1) last[1] = r[1]; else merged.push([...r]);
}

// 2. silences in the source, from the audio itself (word timings stretch over pauses)
function silences(file) {
  const r = run("ffmpeg", ["-hide_banner", "-i", file, "-vn", "-af", "silencedetect=noise=-38dB:d=0.25", "-f", "null", "-"]);
  const out = [];
  let s = null;
  for (const l of (r.stderr || "").split("\n")) {
    let m;
    if ((m = l.match(/silence_start: (-?[\d.]+)/))) s = Math.max(0, +m[1]);
    if ((m = l.match(/silence_end: ([\d.]+)/)) && s !== null) { out.push([s, +m[1]]); s = null; }
  }
  return out;
}
const quiet = silences(video);

// 3. word ranges -> source segments, split at long pauses
const segs = [];
for (const [x, y] of merged) {
  const prevEnd = x > 0 ? words[x - 1].e : 0;
  const nextStart = y + 1 < words.length ? words[y + 1].s : info.duration;
  let s = Math.max(prevEnd, words[x].s - PAD, 0);
  const e = Math.min(nextStart, words[y].e + PAD * 2, info.duration);
  for (const [qs, qe] of quiet) {
    if (qe <= s || qs >= e) continue;
    const a0 = Math.max(qs, s), b0 = Math.min(qe, e);
    if (b0 - a0 <= PAUSE) continue;
    if (a0 === s) { s = b0 - PAUSE / 2; continue; }           // leading silence
    if (b0 === e) { segs.push({ s, e: a0 + PAUSE / 2 }); s = e; break; } // trailing silence
    segs.push({ s, e: a0 + PAUSE / 2 });                        // inner pause: split
    s = b0 - PAUSE / 2;
  }
  if (e - s > 0.05) segs.push({ s, e });
}
if (!segs.length) die("nothing left to keep after cutting.");

// 4. one filter graph: trim each piece, 15 ms audio fades at every join, constant 30 fps
const W = info.width, H = info.height, long = Math.max(W, H);
const scale = long > 1920 ? (W >= H ? "scale=1920:-2" : "scale=-2:1920") : "scale=trunc(iw/2)*2:trunc(ih/2)*2";
let g = "";
segs.forEach((p, i) => {
  const d = p.e - p.s;
  g += `[0:v]trim=start=${p.s.toFixed(3)}:end=${p.e.toFixed(3)},setpts=PTS-STARTPTS[v${i}];`;
  g += `[0:a]atrim=start=${p.s.toFixed(3)}:end=${p.e.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=${Math.max(0, d - 0.015).toFixed(3)}:d=0.015[a${i}];`;
});
g += segs.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${segs.length}:v=1:a=1[vc][ac];[vc]fps=30,${scale},format=yuv420p,tpad=stop_mode=clone:stop_duration=${TAIL}[v];[ac]aresample=48000,apad=pad_dur=${TAIL}[a]`;
fs.mkdirSync("work", { recursive: true });
fs.writeFileSync("work/cut.filter", g);
console.log(`Cutting ${segs.length} pieces from ${info.duration.toFixed(1)}s of footage...`);
const graphArgs = g.length < 24000 ? ["-filter_complex", g] : ["-/filter_complex", "work/cut.filter"];
ffmpeg(["-i", video, ...graphArgs, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "30",
  "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-movflags", "+faststart", "work/cut.mp4"], "cutting");
fs.rmSync("work/cut.filter", { force: true });

// 5. remap words onto the cut
let t = 0;
const map = segs.map(p => { const o = { src_in: +fmt(p.s), src_out: +fmt(p.e), out_in: +fmt(t) }; t += p.e - p.s; return o; });
// Every word in the keep list survives. ASR often stretches a word over a pause that was removed,
// so an edge that falls in a removed gap snaps to the nearest kept audio instead of dropping the word.
const toCut = (src, side) => {
  for (let i = 0; i < segs.length; i++) {
    const p = segs[i];
    if (src >= p.s && src <= p.e) return map[i].out_in + (src - p.s);
  }
  // in a gap: a start snaps forward to the next piece, an end snaps back to the previous piece
  if (side === "start") { const i = segs.findIndex(p => p.s > src); return i < 0 ? t : map[i].out_in; }
  let j = -1; segs.forEach((p, i) => { if (p.e < src) j = i; });
  return j < 0 ? 0 : map[j].out_in + (segs[j].e - segs[j].s);
};
const cw = [];
for (const [x, y] of merged) {
  for (let k = x; k <= y; k++) {
    const w = words[k];
    const s = toCut(w.s, "start"), e = toCut(w.e, "end");
    cw.push({ w: w.w, s: +s.toFixed(3), e: +Math.max(s + 0.05, e).toFixed(3) });
  }
}
// pieces can play out of source order, so keep words in cut order and stop any word overlapping the next
cw.sort((p, q) => p.s - q.s);
cw.forEach((w, i) => { if (cw[i + 1] && w.e > cw[i + 1].s) w.e = Math.max(w.s + 0.02, cw[i + 1].s); });
writeWords("edit/cut.words", cw);
const out = probe("work/cut.mp4");
writeJSON("edit/cut.map.json", { source: video, duration: +out.duration.toFixed(3), width: out.width, height: out.height, pieces: map });

// 6. report what is left
const left = silences("work/cut.mp4").filter(([s, e]) => e - s > 1.0 && s > 0.3 && e < out.duration - 0.3);
console.log(`OK: work/cut.mp4  ${out.width}x${out.height}  ${out.duration.toFixed(1)}s  (was ${info.duration.toFixed(1)}s, ${segs.length} pieces)`);
console.log(`Wrote edit/cut.words.txt and edit/cut.lines.txt. Times in these files are cut times: use them in edit.json.`);
// half sentences are the most common cut mistake: point them out
const ends = w => /[.?!]["')\]]?$/.test(w.w);
merged.forEach(([x, y]) => {
  if (x > 0 && !ends(words[x - 1])) console.log(`CHECK: the kept part starting at word ${x} ("${words.slice(x, x + 4).map(w => w.w).join(" ")}...") starts in the middle of a sentence. Fine if it still makes sense on its own.`);
  if (y < words.length - 1 && !ends(words[y])) console.log(`CHECK: the kept part ending at word ${y} ("...${words.slice(Math.max(x, y - 3), y + 1).map(w => w.w).join(" ")}") stops in the middle of a sentence. Read edit/cut.lines.txt and make sure it still makes sense.`);
});
if (left.length) console.log(`NOTE: ${left.length} pause(s) over 1s remain, at ${left.map(([s]) => s.toFixed(1) + "s").join(", ")}. Fine if deliberate.`);
