#!/usr/bin/env node
// Make the render ready to post: loudness to a target, fast start, then verify the file.
//   node scripts/finish.mjs work/render.mp4 [--out final.mp4] [--lufs -14]
// The picture is copied, not re-encoded. Only the audio is processed.
import fs from "node:fs";
import { args, die, ffmpeg, probe, run } from "./lib.mjs";

const a = args();
const src = a._[0] || "work/render.mp4";
const out = a.out || "final.mp4";
const target = +(a.lufs ?? -14);
if (!fs.existsSync(src)) die(`${src} not found. Render first: npx hyperframes render work --output work/render.mp4`);

function loudness(file) {
  const r = run("ffmpeg", ["-hide_banner", "-i", file, "-vn", "-af", `loudnorm=I=${target}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
  const m = (r.stderr || "").match(/\{[\s\S]*?\}/g);
  if (!m) die(`could not measure loudness of ${file}`);
  return JSON.parse(m[m.length - 1]);
}

const info = probe(src);
if (!info.hasAudio) die(`${src} has no audio. Check that the voice video in work/index.html has data-has-audio="true".`);
const L = loudness(src);
const I = +L.input_i, TP = +L.input_tp;
console.log(`Measured ${I.toFixed(1)} LUFS, true peak ${TP.toFixed(1)} dBTP. Target ${target} LUFS.`);
const audio = Math.abs(I - target) > 1 || TP > -1
  ? ["-af", `loudnorm=I=${target}:TP=-1.5:LRA=11:measured_I=${L.input_i}:measured_TP=${L.input_tp}:measured_LRA=${L.input_lra}:measured_thresh=${L.input_thresh}:offset=${L.target_offset}:linear=true,aresample=48000`]
  : [];
ffmpeg(["-i", src, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", ...audio, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], "finishing");

// verify: decode everything once, then measure again
const dec = run("ffmpeg", ["-v", "error", "-i", out, "-f", "null", "-"]);
const errors = (dec.stderr || "").trim();
const f = probe(out), L2 = loudness(out);
console.log(`OK: ${out}  ${f.width}x${f.height}  ${f.duration.toFixed(1)}s  ${(fs.statSync(out).size / 1e6).toFixed(1)} MB  ${(+L2.input_i).toFixed(1)} LUFS`);
if (errors) console.log("WARNING: decoding reported errors:\n" + errors.split("\n").slice(0, 5).join("\n"));
if (f.width !== 1080 || f.height !== 1920) console.log("WARNING: not 1080x1920.");
if (Math.abs(f.duration - info.duration) > 0.2) console.log(`WARNING: length changed from ${info.duration.toFixed(1)}s.`);
console.log("Now watch it once with sound, then run clean.mjs to free the disk space.");
