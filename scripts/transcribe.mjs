#!/usr/bin/env node
// Word-level transcript of a video.
//
//   node scripts/transcribe.mjs <video> [--engine groq|deepgram|local] [--language en] [--terms "Name,Other Name"]
//   node scripts/transcribe.mjs --import <file.json|.srt|.vtt>
//
// Writes edit/words.json and edit/words.txt (index, start, end, word) in the current folder.
// groq needs GROQ_API_KEY, deepgram needs DEEPGRAM_API_KEY, in the environment or a .env file.
// local runs `npx hyperframes transcribe` (on-device, may need a one-time model install).
import fs from "node:fs";
import path from "node:path";
import { args, die, ffmpeg, probe, run, secret, writeWords, norm } from "./lib.mjs";

const a = args();
const outBase = a.out || "edit/words";
fs.mkdirSync(path.dirname(outBase), { recursive: true });

// Find the word list inside any transcript JSON: the longest array of {word|text, start, end}.
function wordsFrom(json) {
  let best = [];
  const walk = v => {
    if (Array.isArray(v)) {
      const ok = v.filter(x => x && typeof x === "object" && isFinite(x.start) && isFinite(x.end) && typeof (x.punctuated_word ?? x.word ?? x.text) === "string");
      if (ok.length > best.length && ok.length >= v.length * 0.8) best = ok;
      v.forEach(walk);
    } else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(json);
  return best.map(x => ({ w: String(x.punctuated_word ?? x.word ?? x.text).trim(), s: +x.start, e: +x.end })).filter(x => x.w);
}

// Whisper word lists have no punctuation. Borrow it from the segment text when the words line up.
function punctuate(words, text) {
  const toks = String(text || "").split(/\s+/).filter(Boolean);
  let j = 0;
  for (const w of words) {
    for (let k = j; k < Math.min(j + 4, toks.length); k++) {
      if (norm(toks[k]) === norm(w.w)) { w.w = toks[k]; j = k + 1; break; }
    }
  }
  return words;
}

function fromSubtitles(src) {
  // SRT/VTT have cue timing only: spread each cue's duration across its words by length.
  const out = [];
  const t = s => { const m = s.trim().replace(",", ".").split(":").map(Number); return m.length === 3 ? m[0] * 3600 + m[1] * 60 + m[2] : m[0] * 60 + m[1]; };
  for (const block of src.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = block.split("\n");
    const i = lines.findIndex(l => l.includes("-->"));
    if (i < 0) continue;
    const [s, e] = lines[i].split("-->").map(x => t(x.split(" ").filter(Boolean)[0]));
    const ws = lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean);
    const total = ws.reduce((n, w) => n + w.length + 1, 0);
    let c = s;
    for (const w of ws) { const d = (e - s) * (w.length + 1) / total; out.push({ w, s: c, e: c + d }); c += d; }
  }
  return out;
}

function save(words, how) {
  if (!words.length) die("no words found. Is there speech in the audio?");
  words.sort((x, y) => x.s - y.s);
  writeWords(outBase, words);
  const last = words[words.length - 1].e;
  console.log(`OK: ${words.length} words, ${last.toFixed(1)}s of speech (${how}).`);
  console.log(`Wrote ${outBase}.json and ${outBase}.txt. Read edit/lines.txt next (one sentence per line).`);
}

if (a.import) {
  const f = a.import;
  if (!fs.existsSync(f)) die(`file not found: ${f}`);
  const raw = fs.readFileSync(f, "utf8");
  if (/\.(srt|vtt)$/i.test(f)) save(fromSubtitles(raw), "imported subtitles, word times are estimated");
  else {
    const j = JSON.parse(raw);
    save(Array.isArray(j) && j[0] && "w" in j[0] ? j : punctuate(wordsFrom(j), j.text), "imported");
  }
  process.exit(0);
}

const video = a._[0];
if (!video) die("usage: node scripts/transcribe.mjs <video> [--engine groq|deepgram|local]");
const info = probe(video);
if (!info.hasAudio) die(`${video} has no audio track.`);

const engine = a.engine || (secret("GROQ_API_KEY") ? "groq" : secret("DEEPGRAM_API_KEY") ? "deepgram" : null);
if (!engine) die(
  "no transcription key found.\n" +
  "  Free option: create a Groq account, make an API key, and put GROQ_API_KEY=... in a .env file in this folder.\n" +
  "  Or: DEEPGRAM_API_KEY in .env, or --engine local, or --import an existing transcript.\n" +
  "  Never paste the key into the chat.");

fs.mkdirSync("work", { recursive: true });
const terms = String(a.terms || "").split(",").map(s => s.trim()).filter(Boolean);

if (engine === "groq" || engine === "deepgram") {
  const key = secret(engine === "groq" ? "GROQ_API_KEY" : "DEEPGRAM_API_KEY");
  if (!key) die(`${engine === "groq" ? "GROQ_API_KEY" : "DEEPGRAM_API_KEY"} is not set. Add it to .env in this folder (never in chat).`);
  // Small speech-only file: mono Opus at 32 kbps is about 0.25 MB per minute, far under upload limits.
  const audio = "work/speech.ogg";
  ffmpeg(["-i", video, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libopus", "-b:a", "32k", audio], "extracting audio");
  const body = fs.readFileSync(audio);
  console.log(`Uploading ${(body.length / 1e6).toFixed(1)} MB of audio to ${engine}...`);
  let words;
  if (engine === "groq") {
    const fd = new FormData();
    fd.append("file", new Blob([body], { type: "audio/ogg" }), "speech.ogg");
    fd.append("model", a.model || "whisper-large-v3-turbo");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    fd.append("timestamp_granularities[]", "segment");
    if (a.language) fd.append("language", a.language);
    if (terms.length) fd.append("prompt", terms.join(", "));
    const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
    if (!r.ok) die(`groq answered ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    words = punctuate(wordsFrom(j.words ? { words: j.words } : j), j.text);
  } else {
    const q = new URLSearchParams({ model: a.model || "nova-3", smart_format: "true", punctuate: "true", filler_words: "true" });
    if (a.language) q.set("language", a.language); else q.set("detect_language", "true");
    terms.forEach(t => q.append("keyterm", t));
    const r = await fetch("https://api.deepgram.com/v1/listen?" + q, { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "audio/ogg" }, body });
    if (!r.ok) die(`deepgram answered ${r.status}: ${(await r.text()).slice(0, 300)}`);
    words = wordsFrom((await r.json()).results);
  }
  fs.rmSync(audio, { force: true });
  save(words, engine);
} else if (engine === "local") {
  const audio = "work/speech.wav";
  ffmpeg(["-i", video, "-vn", "-ac", "1", "-ar", "16000", audio], "extracting audio");
  const list = ["hyperframes", "transcribe", audio, "--json", "--model", a.model || "small.en"];
  if (a.language) list.push("--language", a.language);
  console.log("Running on-device transcription through HyperFrames. The first run can download a model.");
  const r = run(process.platform === "win32" ? "npx.cmd" : "npx", list, { shell: process.platform === "win32" });
  fs.rmSync(audio, { force: true });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch {}
  if (!j || j.ok === false) die(
    "local transcription is not available on this machine yet.\n" +
    (j && j.install ? `  HyperFrames suggests: npx hyperframes ${j.install}  (a large one-time model download; ask the user first)\n` : "") +
    "  Or use the free Groq route (GROQ_API_KEY in .env), or --import a transcript from another tool.");
  const words = wordsFrom(j);
  save(words.length ? words : wordsFrom(readMaybe(j)), "local");
} else die(`unknown engine "${engine}". Use groq, deepgram or local.`);

function readMaybe(j) {
  // Some versions print a path to the transcript file instead of the words.
  const p = j && (j.output || j.transcript || j.path);
  return p && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
}
