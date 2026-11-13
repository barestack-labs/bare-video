// Read edit/edit.json, resolve word anchors to cut times, and list every problem in plain words.
// Used by check.mjs and build.mjs. Problems stop the build; warnings do not.
import fs from "node:fs";
import path from "node:path";
import { readJSON, norm } from "./lib.mjs";

export const THEMES = ["graphite", "daylight", "paper", "loud"];
export const LAYOUTS = ["face", "split", "full"];
export const TYPES = ["none", "title", "label", "list", "steps", "stat", "compare", "quote", "chapter", "end", "media"];
const KNOWN = ["at", "layout", "type", "text", "sub", "kicker", "items", "style", "value", "source", "src", "fit", "zoom", "punch", "win", "number", "from", "note"];
const BLOCK_THEMES = ["daylight", "loud"];

export function loadPlan(file = "edit/edit.json") {
  const P = [], Wn = [];
  const plan = readJSON(file);
  const map = readJSON("edit/cut.map.json");
  let words = readJSON("edit/cut.words.json");
  const D = +(map.duration || 0);
  if (!D) P.push("edit/cut.map.json has no duration. Run cut.mjs first.");

  const theme = plan.theme || "graphite";
  if (!THEMES.includes(theme)) P.push(`theme "${theme}" does not exist. Use one of: ${THEMES.join(", ")}.`);
  const captions = plan.captions || "bold";
  if (!["bold", "clean", "off"].includes(captions)) P.push(`captions must be "bold", "clean" or "off".`);
  if (plan.accent && !/^#[0-9a-f]{6}$/i.test(plan.accent)) P.push(`accent must look like "#ff5b37".`);
  const focus = Array.isArray(plan.focus) && plan.focus.length === 2 ? plan.focus.map(Number) : [0.5, 0.4];
  if (focus.some(v => !(v >= 0 && v <= 1))) P.push(`focus is [x, y] between 0 and 1, for example [0.5, 0.4].`);

  // caption spelling fixes: {"wrong words": "right words"}
  const fixes = plan.fix && typeof plan.fix === "object" ? plan.fix : {};
  words = words.map(w => ({ ...w }));
  for (const [wrong, right] of Object.entries(fixes)) {
    const a = String(wrong).split(/\s+/).map(norm), b = String(right).split(/\s+/);
    let hit = false;
    for (let i = 0; i + a.length <= words.length; i++) {
      if (a.every((x, j) => norm(words[i + j].w) === x)) {
        const tail = (words[i + a.length - 1].w.match(/[.,?!;:]+$/) || [""])[0];
        const span = { s: words[i].s, e: words[i + a.length - 1].e };
        const repl = b.map((w, j) => ({ w: w + (j === b.length - 1 ? tail : ""), s: span.s + (span.e - span.s) * j / b.length, e: span.s + (span.e - span.s) * (j + 1) / b.length }));
        words.splice(i, a.length, ...repl);
        hit = true;
      }
    }
    if (!hit) Wn.push(`fix "${wrong}" was not found in the captions.`);
  }

  // "at" can be seconds, or words from edit/cut.lines.txt (optionally "words@12.5" to pick the one near 12.5s)
  const N = words.map(w => norm(w.w));
  function find(phrase, after, before = D) {
    let hint = null;
    let text = String(phrase);
    const m = text.match(/@\s*([\d.]+)\s*$/);
    if (m) { hint = +m[1]; text = text.slice(0, m.index); }
    const q = text.split(/\s+/).map(norm).filter(Boolean);
    if (!q.length) return null;
    const hits = [];
    for (let i = 0; i + q.length <= N.length; i++) if (q.every((x, j) => N[i + j] === x)) hits.push(words[i].s);
    if (!hits.length) return null;
    if (hint !== null) return hits.reduce((p, c) => Math.abs(c - hint) < Math.abs(p - hint) ? c : p);
    return hits.find(t => t >= after - 0.05 && t < before) ?? hits.find(t => t >= after - 0.05) ?? null;
  }
  const when = (at, after, label, before) => {
    if (typeof at === "number") return at;
    if (typeof at === "string" && /^[\d.]+$/.test(at.trim())) return +at;
    if (typeof at === "string") {
      const t = find(at, after, before);
      if (t === null) P.push(`${label}: could not find the words "${at}" in edit/cut.words.txt. Copy them exactly from edit/cut.lines.txt.`);
      return t;
    }
    P.push(`${label}: "at" must be seconds or words that are spoken.`);
    return null;
  };

  const raw = Array.isArray(plan.scenes) ? plan.scenes : [];
  if (!raw.length) P.push(`edit.json needs a "scenes" list.`);
  const scenes = [];
  let after = 0;
  raw.forEach((s, i) => {
    const label = `scene ${i + 1}${s.type ? ` (${s.type})` : ""}`;
    const unknown = Object.keys(s).filter(k => !KNOWN.includes(k));
    if (unknown.length) P.push(`${label}: unknown field(s) ${unknown.map(k => `"${k}"`).join(", ")}. Allowed: ${KNOWN.join(", ")}.`);
    const type = s.type || "none";
    if (!TYPES.includes(type)) { P.push(`${label}: type "${type}" does not exist. Use one of: ${TYPES.join(", ")}.`); return; }
    const layout = s.layout || (type === "none" || type === "label" ? "face" : type === "media" ? "full" : "split");
    if (!LAYOUTS.includes(layout)) { P.push(`${label}: layout "${layout}" does not exist. Use face, split or full.`); return; }
    let t = i === 0 ? 0 : when(s.at, after, label);
    if (t === null) return;
    if (i === 0 && s.at && s.at !== 0) Wn.push(`scene 1 always starts at 0.`);
    t = Math.max(0, Math.min(D, t - (typeof s.at === "string" ? 0.08 : 0)));
    if (i > 0 && t < after) P.push(`${label}: starts at ${t.toFixed(2)}s, before the scene above it (${after.toFixed(2)}s). Keep scenes in time order.`);
    after = t;
    scenes.push({ ...s, i, label, type, layout, t });
  });
  scenes.forEach((s, k) => { s.end = k + 1 < scenes.length ? scenes[k + 1].t : D; });

  const said = N.join(" ");
  const kept = [];
  scenes.forEach((s, k) => {
    const len = s.end - s.t;
    const { label } = s;
    if (len < 0.9) P.push(`${label}: only ${len.toFixed(2)}s long. A scene needs at least 1 second. Merge it or move it.`);
    if (s.type !== "none" && s.type !== "media" && len > 10) Wn.push(`${label}: ${len.toFixed(1)}s on one graphic is long. Add a scene or a face beat.`);
    const words = x => String(x || "").replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
    const need = (field, why) => { if (!s[field]) P.push(`${label}: needs "${field}" (${why}).`); };
    if (["title", "label", "quote", "chapter", "end"].includes(s.type)) need("text", "the words on screen");
    if (s.text && words(s.text) > 9) Wn.push(`${label}: "${s.text}" is ${words(s.text)} words. On-screen text works best at 2 to 7 words.`);
    if ((String(s.text || "").match(/\*/g) || []).length > 2) Wn.push(`${label}: highlight one word or phrase, not several.`);
    // items
    if (["list", "steps", "compare"].includes(s.type)) {
      const items = (s.items || []).map(x => typeof x === "string" ? { text: x } : { ...x });
      const max = s.type === "compare" ? 2 : 5;
      if (items.length < 2) P.push(`${label}: needs at least 2 items.`);
      if (items.length > max) P.push(`${label}: has ${items.length} items, the most is ${max}. Split it into two scenes.`);
      items.forEach((it, j) => {
        if (!it.text) P.push(`${label}: item ${j + 1} needs "text".`);
        if (String(it.text || "").replace(/\*/g, "").length > 30) Wn.push(`${label}: item "${it.text}" is long. Aim for under 24 characters.`);
        // item time: given "at", else the first time its first real word is spoken inside the scene, else spaced out
        let ti = null;
        if (it.at !== undefined) ti = when(it.at, s.t, `${label} item ${j + 1}`, s.end);
        else {
          const key = String(it.text || "").replace(/\*/g, "").split(/\s+/).map(norm).find(x => x.length >= 3);
          if (key) { const f = find(key, s.t, s.end); if (f !== null && f < s.end) ti = f - 0.1; }
        }
        const fallback = s.t + 0.5 + j * 0.6;
        it.t = Math.max(s.t + 0.35, Math.min(s.end - 0.6, ti ?? fallback));
        if (j && it.t < items[j - 1].t + 0.25) it.t = items[j - 1].t + 0.35;
      });
      s.items = items;
      if (items[0] && items[0].t - s.t > 2.2) Wn.push(`${label}: the first item appears ${(items[0].t - s.t).toFixed(1)}s after the scene starts, so the screen sits empty. Start the scene closer to the first item.`);
    }
    if (s.type === "stat") {
      need("value", 'the number, for example "312 km/h"');
      const nums = String(s.value || "").match(/\d[\d,.]*/g) || [];
      for (const n of nums) {
        const digits = n.replace(/[,.]$/, "");
        const spoken = said.includes(norm(digits)) || said.includes(norm(digits.replace(/,/g, "")));
        if (!spoken && !s.source) P.push(`${label}: the number ${digits} is not in what was said. Only show real numbers. If it was said in words (like "three point two") or comes from a real document, add "source": "where it is from".`);
      }
    }
    if (s.type === "media") {
      need("src", "a file in the assets folder");
      if (s.src && !fs.existsSync(s.src)) P.push(`${label}: file "${s.src}" does not exist. Paths are relative to the video folder.`);
      if (s.fit && !["cover", "contain"].includes(s.fit)) P.push(`${label}: fit must be "cover" or "contain".`);
    }
    const prev = scenes[k - 1], prev2 = scenes[k - 2];
    if (prev && prev2 && s.type !== "none" && s.type === prev.type && s.type === prev2.type) Wn.push(`${label}: three ${s.type} scenes in a row looks repetitive.`);
    kept.push(s);
  });

  // sound effects and music: [{"at": ..., "src": "assets/sfx/pop.mp3", "volume": 0.5}]
  const sfx = (Array.isArray(plan.sfx) ? plan.sfx : []).map((x, i) => {
    const t = when(x.at, 0, `sfx ${i + 1}`);
    if (!x.src || !fs.existsSync(x.src)) P.push(`sfx ${i + 1}: file "${x.src}" does not exist.`);
    return { ...x, t: Math.max(0, t ?? 0), volume: +(x.volume ?? 0.6) };
  });
  const music = plan.music && plan.music.src ? { volume: 0.12, ...plan.music } : null;
  if (music && !fs.existsSync(music.src)) P.push(`music: file "${music.src}" does not exist.`);

  // pace report
  const graphic = kept.filter(s => s.type !== "none").reduce((n, s) => n + (s.end - s.t), 0);
  let longestFace = 0;
  kept.forEach(s => { if (s.type === "none") longestFace = Math.max(longestFace, s.end - s.t); });
  if (longestFace > 12) Wn.push(`a face-only stretch lasts ${longestFace.toFixed(1)}s. Fine for a strong moment, otherwise add a visual.`);

  const joins = (map.pieces || []).slice(1).map(p => p.out_in);
  return {
    problems: P, warnings: Wn,
    stats: { duration: D, scenes: kept.length, avg: kept.length ? D / kept.length : 0, graphicShare: D ? graphic / D : 0 },
    data: {
      duration: +D.toFixed(3), theme, captions, accent: plan.accent || null, focus,
      highlight: plan.highlight || (BLOCK_THEMES.includes(theme) ? "block" : "color"),
      footage: { width: map.width, height: map.height },
      words, joins, sfx, music,
      scenes: kept.map(s => ({ ...s, t: +s.t.toFixed(3), end: +s.end.toFixed(3) })),
    },
  };
}

export function report(r) {
  const { problems, warnings, stats } = r;
  console.log(`${stats.scenes} scenes over ${stats.duration.toFixed(1)}s, one every ${stats.avg.toFixed(1)}s, graphics on screen ${(stats.graphicShare * 100).toFixed(0)}% of the time.`);
  warnings.forEach(w => console.log("  warning: " + w));
  problems.forEach(p => console.log("  PROBLEM: " + p));
  if (problems.length) console.log(`\n${problems.length} problem(s). Fix edit/edit.json and run check again.`);
  else console.log(warnings.length ? "\nOK with warnings. Read them, fix what is real, then build." : "\nOK. Run build next.");
}
