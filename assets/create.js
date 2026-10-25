/* Bare Video prompt builder: no build step, no dependencies. */

const $ = (sel) => document.querySelector(sel);

const DEFAULTS = Object.freeze({
  mode: "plan",
  goal: "",
  video_path: "./input/video.mp4",
  style: "bare",
  captions: "dynamic",
  sfx: "restrained",
  asr: "auto",
  experience: "new",
  offer_skill: false,
  finish: "review",
});

const LABELS = {
  mode: { plan: "Plan with me", oneshot: "One-shot first draft" },
  style: {
    bare: "Bare default",
    captions: "Captions only",
    tutorial: "Tutorial or proof-heavy",
    face: "Face-first minimal",
    agent: "Agent decides",
    reference: "My own reference",
  },
  captions: { dynamic: "Dynamic", clean: "Clean", none: "No captions" },
  sfx: { restrained: "Restrained", minimal: "Minimal", none: "None" },
  asr: {
    auto: "Whatever works here",
    cloud: "My cloud key",
    local: "Local only, no cloud",
  },
  experience: { new: "New dedicated folder", existing: "My existing workspace" },
  finish: { review: "Preview first, then export", oneshot: "Finish in one go" },
};

const SKILL_OFF = "Skip it";
const SKILL_ON = "Offered at the end";
const ADVANCED_KEYS = ["style", "captions", "sfx", "asr", "experience"];
const DRAFT_KEY = "bare-video.draft.v1";

const SUMMARY = [
  ["The edit", "mode"],
  ["Finish", "finish"],
  ["Visual direction", "style"],
  ["Captions", "captions"],
  ["Sound", "sfx"],
  ["Transcription", "asr"],
  ["Project folder", "experience"],
  ["Skill install", "offer_skill"],
];

let state = { ...DEFAULTS };

/* ------------------------------ Prompt text ------------------------------- */

const styleText = () => ({
  bare: "Start simple and adapt to the footage. Use the speaker, captions, and supporting visuals where they help. Let the meaning and my taste guide the edit, not a fixed template.",
  captions: "Keep the original footage full-screen most of the time. Use cuts and captions as the primary edit language. Avoid routine full-screen graphic scenes.",
  tutorial: "Make this tutorial and proof-heavy. Prioritize real screen recordings, screenshots, demos, repos, and results. Prefer real screen recordings, screenshots, demos, repos, and results when useful.",
  face: "Keep this face-first and minimal. Stay on the speaker for most of the video and interrupt only when a visual is genuinely more useful.",
  agent: "Choose the visual mix yourself from the footage, the goal, and the Bare Video skill. Do not add visuals just for variety.",
  reference:
    "Look in ./references/ and derive a style from it: layout rhythm, framing, caption treatment, motion, graphic density, sound, pacing. Recreate that general editing language. Do not copy protected branding or copyrighted assets unless I have the rights to them.",
}[state.style]);

const captionText = () => ({
  dynamic: "Use lively word-synced captions in readable chunks suited to the speech. Keep emphasis purposeful and adjust placement around the footage and supporting visuals.",
  clean: "Use calmer captions: longer readable chunks, minimal animation.",
  none: "Do not add routine captions. Use on-screen text only when it materially improves the edit.",
}[state.captions]);

const sfxText = () => ({
  restrained: "Use restrained, contextual sound effects. Speech always wins.",
  minimal: "Use very little SFX. Accent only major layout changes, proof reveals, or the payoff.",
  none: "Do not add SFX unless I ask later.",
}[state.sfx]);

function asrText() {
  const env =
    "Keep keys out of chat and logs. Use the provider's documented local configuration; do not assume it loads .env automatically. Ask before uploading private audio or making a paid call.";
  return {
    auto: `Use an existing transcript or an available transcription tool. Explain any missing requirement, including model download size and destination, before proceeding. ${env}`,
    cloud: `Use my configured cloud provider for transcription after confirming I approve sending it this audio. If no provider is configured, explain what is needed. ${env}`,
    local:
      "Transcribe locally only, no cloud calls. If a local model must be downloaded, explain its approximate size, storage impact, and project-local destination first, and ask permission.",
  }[state.asr];
}

function setupText() {
  if (state.experience === "existing") {
    return (
      "I am comfortable with my workspace. Do not reorganize it to match a template: if the skill suggests a folder layout, adapt it to what already exists instead of moving my files. " +
      "Reuse installed FFmpeg and other useful tools before suggesting anything new."
    );
  }
  return (
    "Treat this as a first video project. Keep all new work inside the current dedicated project folder. " +
    "A simple layout is ./input/, ./references/, ./assets/, ./workspace/, and ./output/. " +
    "Reuse installed tools first. Add folders or dependencies only when the edit needs them."
  );
}

const planText = () =>
  state.mode === "plan"
    ? "Before building the edit, show me a concise plan: proposed cuts (what gets removed and why), layout choices, captions, and sound moments. Wait for my approval before building the first preview."
    : "Build the first browser preview in one shot without stopping for plan approval. Self-check it before showing me the preview.";

const finishText = () =>
  state.finish === "review"
    ? "Open the browser preview and stop there. Wait for my feedback and approval before any final rendering or export."
    : "Preview, self-check, and export the final file in the same run. Any judgment call that is genuinely ambiguous still comes back to me.";

/* ------------------------------ The prompt -------------------------------- */

function buildPrompt() {
  const goal = state.goal || "Help me find the strongest edit in this footage.";
  return `Use the Bare Video skill to edit my video.

Repo: https://github.com/barestack-labs/bare-video
Clone or locate the repo and read .agents/skills/bare-video/SKILL.md. The skill is guidance, not a recipe. Use your judgment and my preferences below.

Video: ${state.video_path}
Goal: ${goal}

${setupText()}
Inspect installed tools and use their current help. Use FFmpeg directly for media work. Use HyperFrames when a browser composition, animation, or preview helps. Bare Video is the skill, not another editing engine.

My preferences:
- Process: ${planText()}
- Visual direction: ${styleText()}
- Captions: ${captionText()}
- Sound: ${sfxText()}
- Transcription: ${asrText()}

Keep the original footage intact and write outputs separately. Judge cuts from meaning, not silence thresholds. Keep useful pauses and reactions. Use real supporting assets rather than invented proof.

Ask before large downloads, global changes, paid services, or uploading private footage. Never put credentials in chat, logs, compositions, or commits.

${finishText()}
Check the actual picture, audio, duration, and synchronization before claiming the edit works. Tell me where the preview or output is, what you verified, and any real limitation.
${state.offer_skill ? "\nAfter this edit works, offer to install the skill for reuse. Ask before changing global configuration." : ""}`;
}

/* --------------------------- State and rendering --------------------------- */

function readState() {
  const data = new FormData($("#builder"));
  return {
    mode: data.get("mode") || DEFAULTS.mode,
    goal: String(data.get("goal") || "").trim(),
    video_path: String(data.get("video_path") || "").trim() || DEFAULTS.video_path,
    style: data.get("style") || DEFAULTS.style,
    captions: data.get("captions") || DEFAULTS.captions,
    sfx: data.get("sfx") || DEFAULTS.sfx,
    asr: data.get("asr") || DEFAULTS.asr,
    experience: data.get("experience") || DEFAULTS.experience,
    offer_skill: data.get("offer_skill") === "yes",
    finish: data.get("finish") || DEFAULTS.finish,
  };
}

function sync() {
  state = readState();
}

function restore(values) {
  for (const [key, val] of Object.entries(values)) {
    document.querySelectorAll(`[name="${key}"]`).forEach((el) => {
      if (el.type === "checkbox") el.checked = val === true;
      else if (el.type === "radio") el.checked = el.value === String(val);
      else el.value = String(val ?? "");
    });
  }
  sync();
}

function advancedDelta() {
  return ADVANCED_KEYS.filter((key) => state[key] !== DEFAULTS[key]).length;
}

function renderRows() {
  const rows = SUMMARY.map(([title, key]) => {
    let value;
    if (key === "offer_skill") value = state.offer_skill ? SKILL_ON : SKILL_OFF;
    else value = LABELS[key]?.[state[key]] ?? "?";
    return { title, value };
  });
  $("#rows").innerHTML = rows
    .map(
      (r) =>
        `<div class="srow"${r.value === "?" ? ' data-missing="1"' : ""}><span>${r.title}</span><b>${r.value}</b></div>`
    )
    .join("");
}

function renderStats() {
  const delta = advancedDelta();
  const el = $("#stats");
  if (delta === 0) {
    el.textContent = "Defaults throughout. The prompt is already complete.";
    el.classList.add("is-neutral");
  } else {
    el.textContent =
      delta === 1
        ? "1 advanced choice changed from default."
        : `${delta} advanced choices changed from default.`;
    el.classList.remove("is-neutral");
  }
  const badge = $("#adv-count");
  badge.textContent = delta === 0 ? "" : `, ${delta} changed`;
}

function renderAll() {
  renderRows();
  renderStats();
}

/* ------------------------------ Draft storage ------------------------------ */

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch (_) {
    /* The form still works when browser storage is unavailable. */
  }
}

function loadDraft() {
  let parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch (_) {
    return;
  }
  if (parsed && typeof parsed === "object") {
    const clean = {};
    for (const key of Object.keys(DEFAULTS)) {
      if (key in parsed) clean[key] = parsed[key];
    }
    restore(clean);
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (_) {
    /* ignore */
  }
}

/* --------------------------------- Dialog --------------------------------- */

const dialog = $("#result");
const promptField = $("#prompt");
const copyStatus = $("#copy-status");
let statusTimer = null;

function flashStatus(message) {
  copyStatus.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 2600);
}

function openResult() {
  promptField.value = buildPrompt();
  copyStatus.textContent = "";
  copyStatus.classList.remove("is-error");
  dialog.showModal();
  promptField.focus();
  promptField.select();
}

async function copyPrompt() {
  const text = promptField.value;
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch (_) {
    copied = false;
  }
  if (!copied) {
    /* Clipboard API can be blocked by permissions policy or insecure context.
       Fall back to a manual selection copy the user can complete with Ctrl+C. */
    try {
      promptField.focus();
      promptField.select();
      copied = document.execCommand("copy");
    } catch (_) {
      copied = false;
    }
  }
  if (copied) {
    copyStatus.classList.remove("is-error");
    flashStatus("Copied. Paste it into your coding agent.");
  } else {
    copyStatus.classList.add("is-error");
    flashStatus("Copy was blocked by the browser. The text is selected: press Ctrl+C now.");
  }
}


/* --------------------------------- Wiring --------------------------------- */

function addListeners() {
  $("#builder").addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    saveDraft();
    openResult();
  });

  $("#builder").addEventListener("input", () => {
    sync();
    saveDraft();
    renderAll();
  });

  document.querySelectorAll("[data-generate]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sync();
      saveDraft();
      openResult();
    });
  });

  $("#copy").addEventListener("click", copyPrompt);
  $("#edit-again").addEventListener("click", () => dialog.close());

  $("#close").addEventListener("click", () => dialog.close());

  $("#reset").addEventListener("click", () => {
    restore({ ...DEFAULTS });
    clearDraft();
    renderAll();
    const advanced = document.querySelector("details.adv");
    if (advanced) advanced.open = false;
  });

  dialog.addEventListener("cancel", () => {
    /* Esc closes the dialog on its own */
  });
}

function init() {
  loadDraft();
  sync();
  renderAll();
  addListeners();
}

init();
