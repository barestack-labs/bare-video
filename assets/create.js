const DEFAULTS={
  goal:"",
  video:"",
  asr:"faster",
  mode:"plan",
  visualPreset:"agent",
  visuals:[],
  visualPace:"active",
  reference:false,
  captions:"dynamic",
  theme:"mono",
  sfx:"balanced",
  finish:"preview",
  skill:false
};

const state={...DEFAULTS};
const KEY="bare-video-configurator-v6";
const PREVIOUS_KEYS=["bare-video-configurator-v5","bare-video-configurator-v4","bare-video-configurator-v3"];
const ALL_VISUALS=["face","split","overlay","proof"];
const steps=[...document.querySelectorAll(".step")];
let current=0;
let lastPreviewMode="face";
const $=selector=>document.querySelector(selector);

function normalizeSaved(saved){
  if(!saved||typeof saved!=="object")return null;
  const clean={...DEFAULTS,...saved};

  if(clean.captions==="agent"||clean.captions==="auto")clean.captions="dynamic";
  if(clean.sfx==="agent"||clean.sfx==="auto")clean.sfx="balanced";
  if(clean.sfx==="heavy")clean.sfx="lots";
  if(clean.sfx==="restrained")clean.sfx="balanced";

  if(clean.asr==="auto"||clean.asr==="local")clean.asr="faster";
  if(!["faster","groq","deepgram","existing"].includes(clean.asr))clean.asr="faster";

  if(!["plan","draft"].includes(clean.mode))clean.mode="plan";
  if(!["active","balanced","calm"].includes(clean.visualPace))clean.visualPace="active";
  if(!["dynamic","clean","none"].includes(clean.captions))clean.captions="dynamic";
  if(!["mono","graphite","plain","orange"].includes(clean.theme))clean.theme="mono";
  if(!["lots","balanced","minimal","none"].includes(clean.sfx))clean.sfx="balanced";
  if(!["preview","final"].includes(clean.finish))clean.finish="preview";
  if(!["agent","all","custom"].includes(clean.visualPreset))clean.visualPreset="agent";
  if(!Array.isArray(clean.visuals))clean.visuals=[];
  clean.visuals=clean.visuals.filter(item=>ALL_VISUALS.includes(item));

  return clean;
}

function load(){
  let saved=null;
  try{
    saved=normalizeSaved(JSON.parse(localStorage.getItem(KEY)||"null"));
    if(!saved){
      for(const oldKey of PREVIOUS_KEYS){
        saved=normalizeSaved(JSON.parse(localStorage.getItem(oldKey)||"null"));
        if(saved)break;
      }
    }
  }catch{}
  Object.assign(state,saved||DEFAULTS);

  $("#goal").value=state.goal||"";
  $("#video-path").value=state.video||"";
  $("#reference-led").checked=!!state.reference;
  $("#skill-install").checked=!!state.skill;
}

function save(){
  state.goal=$("#goal").value.trim();
  state.video=$("#video-path").value.trim();
  state.reference=$("#reference-led").checked;
  state.skill=$("#skill-install").checked;
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
}

function syncSingles(){
  document.querySelectorAll("[data-single]").forEach(group=>{
    const key=group.dataset.single;
    group.querySelectorAll("[data-value]").forEach(button=>{
      button.classList.toggle("is-selected",button.dataset.value===state[key]);
      button.setAttribute("aria-pressed",button.dataset.value===state[key]?"true":"false");
    });
  });
}

function syncVisuals(){
  document.querySelectorAll("[data-visual]").forEach(button=>{
    const selected=state.visuals.includes(button.dataset.visual);
    button.classList.toggle("is-selected",selected);
    button.setAttribute("aria-pressed",selected?"true":"false");
  });
  document.querySelectorAll("[data-visual-preset]").forEach(button=>{
    const selected=button.dataset.visualPreset===state.visualPreset;
    button.classList.toggle("is-selected",selected);
    button.setAttribute("aria-pressed",selected?"true":"false");
  });
}

function syncHelp(){
  const captionHelp={
    dynamic:"Punchy captions follow the speech closely and emphasize the important word in each chunk.",
    clean:"Clean captions stay accurate but use calmer timing, motion, and emphasis.",
    none:"No burned-in captions. The transcript can still guide cuts and timing."
  };
  const soundHelp={
    lots:"Use frequent purposeful accents for visible actions, reveals, transitions, and UI moments.",
    balanced:"Add energy to useful actions and transitions without turning every cut into a sound effect.",
    minimal:"Use sound effects only for the biggest reveals, transitions, or proof moments.",
    none:"Do not add sound effects."
  };
  const paceHelp={
    active:"Most meaningful phrases should trigger a useful visual response.",
    balanced:"Change the visual when it improves understanding or keeps the short moving.",
    calm:"Let the speaker breathe. Change visuals only when the content clearly benefits."
  };

  $("#caption-help").textContent=captionHelp[state.captions]||captionHelp.dynamic;
  $("#sound-help").textContent=soundHelp[state.sfx]||soundHelp.balanced;
  $("#pace-help").textContent=paceHelp[state.visualPace]||paceHelp.active;
}

function previewVisual(mode,copy){
  lastPreviewMode=mode;
  $("#visual-phone").dataset.phoneMode=mode;
  $("#visual-preview-copy").textContent=copy;
}

function syncVisualPreview(){
  if(state.visualPreset==="agent"){
    previewVisual(lastPreviewMode,"The agent chooses the best visual block for each moment.");
    return;
  }
  if(state.visualPreset==="all"){
    previewVisual(lastPreviewMode,"All four blocks are available. The agent still chooses by meaning.");
    return;
  }
  if(state.visuals.length===0){
    previewVisual("face","Choose at least one visual block, or switch back to Agent decides.");
    return;
  }
  const labels={
    face:"Face-first is allowed: keep the speaker full-screen when delivery is the strongest visual.",
    split:"Split-screen is allowed: show the speaker with the real screen, screenshot, or demo.",
    overlay:"Light overlays are allowed: add small proof, labels, logos, stats, or screenshots.",
    proof:"Full-screen proof is allowed: let the real result, repo, website, or demo take the frame."
  };
  const mode=state.visuals.includes(lastPreviewMode)?lastPreviewMode:state.visuals[state.visuals.length-1];
  previewVisual(mode,labels[mode]);
}

function renderStep(){
  steps.forEach((step,index)=>{
    step.classList.toggle("is-active",index===current);
    step.classList.toggle("is-before",index<current);
  });
  $("#progress").style.width=(((current+1)/steps.length)*100)+"%";
  $("#progress-copy").textContent=(current+1)+" of "+steps.length;
  $("#back").disabled=current===0;
  $("#next").textContent=current===steps.length-1?"Build my prompt":"Continue";
  history.replaceState(null,"","#"+(current+1));
}

function validateCurrentStep(){
  if(current!==0)return true;
  save();
  if(state.video)return true;
  $("#video-error").textContent="Paste the video file path your coding agent can access.";
  $("#video-path").focus();
  return false;
}

document.querySelectorAll("[data-single]").forEach(group=>{
  group.addEventListener("click",event=>{
    const button=event.target.closest("[data-value]");
    if(!button)return;
    state[group.dataset.single]=button.dataset.value;
    syncSingles();
    syncHelp();
    save();
  });
});

document.querySelectorAll("[data-visual-preset]").forEach(button=>{
  button.addEventListener("click",()=>{
    const preset=button.dataset.visualPreset;
    state.visualPreset=preset;
    state.visuals=preset==="all"?[...ALL_VISUALS]:[];
    if(preset==="all")lastPreviewMode="overlay";
    syncVisuals();
    syncVisualPreview();
    save();
  });
});

document.querySelectorAll("[data-visual]").forEach(button=>{
  button.addEventListener("click",()=>{
    const mode=button.dataset.visual;
    state.visualPreset="custom";
    lastPreviewMode=mode;
    if(state.visuals.includes(mode)){
      state.visuals=state.visuals.filter(item=>item!==mode);
    }else{
      state.visuals=[...state.visuals,mode];
    }
    if(state.visuals.length===0)state.visualPreset="agent";
    syncVisuals();
    syncVisualPreview();
    save();
  });
});

$("#goal").addEventListener("input",save);
$("#video-path").addEventListener("input",()=>{
  $("#video-error").textContent="";
  save();
});
$("#reference-led").addEventListener("change",save);
$("#skill-install").addEventListener("change",save);

$("#back").addEventListener("click",()=>{
  save();
  if(current>0){
    current--;
    renderStep();
    if(window.innerWidth<=900)window.scrollTo({top:0,behavior:"auto"});
  }
});

$("#next").addEventListener("click",()=>{
  if(!validateCurrentStep())return;
  save();
  if(current<steps.length-1){
    current++;
    renderStep();
    if(window.innerWidth<=900)window.scrollTo({top:0,behavior:"auto"});
    return;
  }
  showResult();
});

$("#start-over").addEventListener("click",()=>{
  Object.assign(state,{...DEFAULTS,visuals:[]});
  try{
    localStorage.removeItem(KEY);
    PREVIOUS_KEYS.forEach(key=>localStorage.removeItem(key));
  }catch{}
  current=0;
  lastPreviewMode="face";
  load();
  syncSingles();
  syncVisuals();
  syncHelp();
  syncVisualPreview();
  $("#video-error").textContent="";
  renderStep();
});

function visualInstruction(){
  const descriptions={
    face:"Face-first: keep the speaker full-screen when delivery is the strongest visual.",
    split:"Split-screen: show the speaker together with a real screen, screenshot, or demo.",
    overlay:"Light overlays: add small real screenshots, logos, labels, cards, or stats over the footage.",
    proof:"Full-screen proof: temporarily let a real result, repo, website, screenshot, or demo take over the frame."
  };

  let text="";
  if(state.visualPreset==="agent"){
    text="All four visual building blocks are available: Face-first, Split-screen, Light overlays, and Full-screen proof. Choose by meaning and available real assets, not by rotation.";
  }else if(state.visualPreset==="all"){
    text="All four visual building blocks are explicitly allowed. Use Face-first, Split-screen, Light overlays, and Full-screen proof when each one genuinely helps. Do not force every block into the video.";
  }else{
    const chosen=state.visuals.map(item=>descriptions[item]).filter(Boolean);
    text="Use only these selected visual building blocks:\n- "+chosen.join("\n- ")+"\nDo not introduce an unselected building block.";
  }

  if(state.reference){
    text+="\nAlso inspect files in ./references/ if that folder exists. Borrow pacing, framing, caption treatment, motion, density, and sound language. Do not copy protected branding or assets.";
  }
  return text;
}

function paceInstruction(){
  return{
    active:"Use an active short-form visual pace. Most meaningful spoken phrases should receive a useful visible response: a layout change, relevant proof, a real overlay, a purposeful crop or motion change, or caption emphasis. Do not mechanically change something on every filler word. Anchor changes to meaning.",
    balanced:"Use a balanced visual pace. Change the presentation when it improves understanding, supports proof, or prevents a dead stretch. Let strong talking-head delivery remain on screen when it works.",
    calm:"Use a calm visual pace. Let the speaker stay on screen for longer stretches and add visual changes only when the content clearly benefits from them."
  }[state.visualPace];
}

function captionInstruction(){
  return{
    dynamic:"Use precise word-timed punchy captions. Keep chunks short and readable. Give each caption chunk a deliberate emphasis treatment, usually one useful word or phrase, without highlighting filler or covering the speaker's mouth, important UI, or proof.",
    clean:"Use precise clean captions with calmer chunking, restrained motion, and selective emphasis. Keep them readable and out of the way of the speaker, UI, and proof.",
    none:"Do not burn captions into the video. The transcript should still guide cuts and timing."
  }[state.captions];
}

function themeInstruction(){
  return{
    mono:"Use the Mono theme for captions and supporting overlays: high-contrast black and white, strong readable type, simple shapes, and no decorative color unless the user's own assets require it.",
    graphite:"Use the Graphite theme for captions and supporting overlays: charcoal, white, and soft gray with restrained contrast and minimal visual noise.",
    plain:"Use the Plain theme for captions and supporting overlays: simple readable text, minimal container treatment, and only the shadow or stroke needed for legibility.",
    orange:"Use the Orange theme for captions and supporting overlays: black and white as the base with orange used only for meaningful emphasis, active words, or small accents."
  }[state.theme];
}

function soundInstruction(){
  return{
    lots:"Use lots of purposeful sound design. Add varied clicks, taps, impacts, soft whooshes, transitions, and UI sounds when they match visible actions. Do not turn repeated sounds into a percussion loop, and keep speech dominant.",
    balanced:"Use balanced sound design. Add useful clicks, taps, impacts, and soft whooshes to real actions, reveals, and transitions, but do not accent every cut. Speech stays dominant.",
    minimal:"Use minimal added SFX. Accent only major transitions, reveals, proof moments, or important on-screen actions.",
    none:"Do not add sound effects."
  }[state.sfx];
}

function transcriptionInstruction(){
  return{
    faster:"Use Faster Whisper locally for transcription. First check whether it and a suitable model are already available. Prefer word-level timestamps. Ask before downloading a model or another large dependency.",
    groq:"Use Groq for transcription. This provider was selected for this edit, so use credentials already configured locally and produce word-level timing when the current API supports it. Never ask me to paste an API key into chat.",
    deepgram:"Use Deepgram for transcription. This provider was selected for this edit, so use credentials already configured locally and preserve detailed word timing when available. Never ask me to paste an API key into chat.",
    existing:"Reuse my existing verified transcript instead of creating a new one. Prefer a transcript with word-level timestamps. If you cannot locate it in the project, ask me for its path before planning cuts."
  }[state.asr];
}

function processInstruction(){
  if(state.mode==="plan"){
    return "After the transcript is ready, plan the edit with me before the heavy build. Show a compact proposal for the hook and retained story, cut decisions, visual beats mapped to the spoken moments, caption/theme treatment, sound cues, and whether HyperFrames would materially help. Let me change the plan, then wait for my approval before building the draft.";
  }
  return "After the transcript is ready, inspect the footage and make the first draft without a planning approval checkpoint. Still make deliberate internal decisions about the hook, cuts, visual beats, captions, and sound. Give me a real preview to react to.";
}

function finishInstruction(){
  return state.finish==="preview"
    ?"Show me a playable draft or browser preview before final export. Wait for my feedback, apply the changes, then export after approval."
    :"Build, self-check, and export in one go unless a real blocker or missing asset requires my decision.";
}

function buildPrompt(){
  const goal=state.goal||"Turn the footage into the strongest truthful short-form edit while keeping my meaning and personality.";

  const lines=[
    "Edit this video using Bare Video.",
    "",
    "Bare Video repo:",
    "https://github.com/barestack-labs/bare-video",
    "",
    "Read .agents/skills/bare-video/SKILL.md first and use it as the editing guide.",
    "",
    "VIDEO",
    "Path: "+state.video,
    "Goal: "+goal,
    "",
    "TRANSCRIPTION",
    transcriptionInstruction(),
    "",
    "WORK WITH ME",
    processInstruction(),
    "",
    "PROJECT + TOOLS",
    "Work in the video project folder I opened. Keep the original footage untouched and keep temporary work and outputs separate. Inspect what is already installed before downloading anything.",
    "Use FFmpeg directly for cuts, reframing, audio, and other media work.",
    "After the transcript and edit plan are clear, decide whether HyperFrames would genuinely improve the composition, motion graphics, or browser preview. If FFmpeg alone is enough, do not install HyperFrames. If HyperFrames would help and it is not already available in this specific video folder, ask before adding it locally to this project. Do not install it globally by default.",
    "",
    "VISUAL BUILDING BLOCKS",
    visualInstruction(),
    "",
    "VISUAL PACE",
    paceInstruction(),
    "",
    "CAPTIONS",
    captionInstruction(),
    themeInstruction(),
    "",
    "SOUND DESIGN",
    soundInstruction(),
    "",
    "EDITING PRINCIPLES",
    "- Make cuts from meaning, delivery, and story. Do not cut speech only because a silence detector found a gap.",
    "- Keep useful pauses, reactions, emphasis, personality, and intentional repetition.",
    "- Anchor visual changes, captions, and sound cues to the words they support.",
    "- Prefer real screenshots, demos, repos, websites, results, logos, and footage over invented proof.",
    "- If a requested visual asset does not exist, stay with the speaker or ask me for the asset. Do not fabricate it.",
    "- Use my confirmed design choices as the source of truth. Bare Video defaults are starting points, not a house style that overrides me.",
    "- Check the actual picture, audio, caption timing, duration, and A/V sync. A successful command is not proof of a good edit.",
    "",
    "FIRST OUTPUT",
    finishInstruction()
  ];

  if(state.skill){
    lines.push(
      "",
      "REUSE THIS LATER",
      "After this edit works, offer two optional paths: copy/install Bare Video into the user-level skill location supported by my coding agent, or create a separate personal style skill from the design rules I actually approved. If I use a knowledge base, store my reusable style rules there rather than changing Bare Video itself. Ask before changing user-level or global configuration."
    );
  }

  lines.push(
    "",
    "At the end, tell me what you changed, what you actually verified, which tools you used, and where the preview or final output is."
  );

  return lines.join("\n");
}

function showResult(){
  $("#prompt").value=buildPrompt();
  $("#result").classList.add("is-visible");
  $("#result").setAttribute("aria-hidden","false");
}

$("#edit").addEventListener("click",()=>{
  $("#result").classList.remove("is-visible");
  $("#result").setAttribute("aria-hidden","true");
});

$("#copy").addEventListener("click",async()=>{
  const prompt=$("#prompt");
  let copied=false;
  try{
    await navigator.clipboard.writeText(prompt.value);
    copied=true;
  }catch{
    prompt.focus();
    prompt.select();
    try{copied=document.execCommand("copy")}catch{}
  }
  $("#copy-status").textContent=copied
    ?"Copied. Paste it into your coding agent."
    :"Copy was blocked. The prompt is selected, press Ctrl+C.";
});

document.addEventListener("keydown",event=>{
  if($("#result").classList.contains("is-visible")){
    if(event.key==="Escape")$("#edit").click();
    return;
  }
  if(event.key==="ArrowLeft"&&current>0)$("#back").click();
  if(
    event.key==="ArrowRight"&&
    current<steps.length-1&&
    document.activeElement.tagName!=="TEXTAREA"&&
    document.activeElement.tagName!=="INPUT"
  )$("#next").click();
});

load();
syncSingles();
syncVisuals();
syncHelp();
syncVisualPreview();

const fromHash=Number(location.hash.replace("#",""));
if(Number.isInteger(fromHash)&&fromHash>=1&&fromHash<=steps.length)current=fromHash-1;
renderStep();
