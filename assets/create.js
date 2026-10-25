const state={
  goal:"",
  video:"./input/video.mp4",
  mode:"draft",
  visualPreset:"agent",
  visuals:[],
  reference:false,
  captions:"agent",
  sfx:"agent",
  asr:"auto",
  finish:"preview",
  skill:false
};

const KEY="bare-video-configurator-v4";
const OLD_KEY="bare-video-configurator-v3";
const ALL_VISUALS=["face","split","overlay","proof"];
const steps=[...document.querySelectorAll(".step")];
let current=0;
let lastPreviewMode="face";
const $=selector=>document.querySelector(selector);

function load(){
  let saved=null;
  try{
    saved=JSON.parse(localStorage.getItem(KEY)||"null");
    if(!saved){
      const old=JSON.parse(localStorage.getItem(OLD_KEY)||"null");
      if(old&&typeof old==="object"){
        saved={
          goal:old.goal||"",
          video:old.video||"./input/video.mp4",
          mode:old.mode||"draft",
          visualPreset:"agent",
          visuals:[],
          reference:old.style==="reference",
          captions:old.captions||"agent",
          sfx:old.sfx==="restrained"?"balanced":(old.sfx||"agent"),
          asr:old.asr||"auto",
          finish:old.finish||"preview",
          skill:!!old.skill
        };
      }
    }
    if(saved&&typeof saved==="object")Object.assign(state,saved);
  }catch{}
  if(!Array.isArray(state.visuals))state.visuals=[];
  $("#goal").value=state.goal||"";
  $("#video-path").value=state.video||"./input/video.mp4";
  $("#reference-led").checked=!!state.reference;
  $("#skill-install").checked=!!state.skill;
}

function save(){
  state.goal=$("#goal").value.trim();
  state.video=$("#video-path").value.trim()||"./input/video.mp4";
  state.reference=$("#reference-led").checked;
  state.skill=$("#skill-install").checked;
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
}

function syncSingles(){
  document.querySelectorAll("[data-single]").forEach(group=>{
    const key=group.dataset.single;
    group.querySelectorAll("[data-value]").forEach(button=>{
      button.classList.toggle("is-selected",button.dataset.value===state[key]);
    });
  });
}

function syncVisuals(){
  document.querySelectorAll("[data-visual]").forEach(button=>{
    button.classList.toggle("is-selected",state.visuals.includes(button.dataset.visual));
  });
  document.querySelectorAll("[data-visual-preset]").forEach(button=>{
    button.classList.toggle("is-selected",button.dataset.visualPreset===state.visualPreset);
  });
}

function syncHelp(){
  const captionHelp={
    agent:"Agent decides how much captioning the video needs.",
    dynamic:"Faster word-synced captions with selective emphasis.",
    clean:"Simpler captions with calmer motion and fewer emphasized words.",
    none:"No captions unless you ask for them later."
  };
  const soundHelp={
    agent:"Agent decides whether sound effects help.",
    heavy:"Frequent sound accents are allowed: clicks, pops, impacts, whooshes, and transitions.",
    balanced:"Use sound effects often enough to add energy, but not on every beat.",
    minimal:"Only accent major transitions, reveals, or proof moments.",
    none:"Do not add sound effects."
  };
  $("#caption-help").textContent=captionHelp[state.captions]||captionHelp.agent;
  $("#sound-help").textContent=soundHelp[state.sfx]||soundHelp.agent;
}

function previewVisual(mode,copy){
  lastPreviewMode=mode;
  $("#visual-phone").dataset.phoneMode=mode;
  $("#visual-preview-copy").textContent=copy;
}

function syncVisualPreview(){
  if(state.visualPreset==="agent"){
    previewVisual("face","Agent decides which building block helps each moment.");
    return;
  }
  if(state.visualPreset==="all"){
    previewVisual(lastPreviewMode,"All four building blocks are available. The agent chooses when to switch.");
    return;
  }
  if(state.visuals.length===0){
    previewVisual("face","Choose at least one building block, or switch back to Agent decides.");
    return;
  }
  const labels={
    face:"Face-first is allowed: keep the speaker full-screen when that is the strongest visual.",
    split:"Split-screen is allowed: combine the speaker with a screen, screenshot, or demo.",
    overlay:"Light overlays are allowed: place small proof, labels, logos, cards, or stats over footage.",
    proof:"Full-screen proof is allowed: let a real screen, result, repo, or demo take over the frame."
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
  $("#next").textContent=current===steps.length-1?"Build prompt":"Continue";
  history.replaceState(null,"","#"+(current+1));
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
$("#video-path").addEventListener("input",save);
$("#reference-led").addEventListener("change",save);
$("#skill-install").addEventListener("change",save);

$("#back").addEventListener("click",()=>{
  save();
  if(current>0){current--;renderStep()}
});

$("#next").addEventListener("click",()=>{
  save();
  if(current<steps.length-1){current++;renderStep();return}
  showResult();
});

$("#start-over").addEventListener("click",()=>{
  Object.assign(state,{
    goal:"",
    video:"./input/video.mp4",
    mode:"draft",
    visualPreset:"agent",
    visuals:[],
    reference:false,
    captions:"agent",
    sfx:"agent",
    asr:"auto",
    finish:"preview",
    skill:false
  });
  try{
    localStorage.removeItem(KEY);
    localStorage.removeItem(OLD_KEY);
  }catch{}
  current=0;
  lastPreviewMode="face";
  load();
  syncSingles();
  syncVisuals();
  syncHelp();
  syncVisualPreview();
  renderStep();
});

function visualInstruction(){
  const descriptions={
    face:"Face-first: keep the speaker full-screen when the person is the strongest visual.",
    split:"Split-screen: show the speaker together with a screen, screenshot, or demo.",
    overlay:"Light overlays: add small screenshots, logos, labels, cards, or stats over the footage.",
    proof:"Full-screen proof: temporarily let a real repo, result, website, screenshot, or demo take over the frame."
  };
  let text="";
  if(state.visualPreset==="agent"){
    text="Use any of these building blocks when useful: Face-first, Split-screen, Light overlays, and Full-screen proof. Choose by meaning, not by rotation. Do not add a visual just to create variety.";
  }else if(state.visualPreset==="all"){
    text="All four building blocks are available. Use Face-first, Split-screen, Light overlays, and Full-screen proof when each one genuinely helps. Do not force every mode into the video.";
  }else{
    const chosen=state.visuals.map(item=>descriptions[item]).filter(Boolean);
    text="Use only these preferred building blocks unless the footage clearly requires something else:\n- "+chosen.join("\n- ");
  }
  if(state.reference){
    text+="\nAlso inspect files in ./references/ and borrow their editing language: pacing, framing, caption treatment, motion, density, and sound. Do not copy protected branding or assets.";
  }
  return text;
}

function captionInstruction(){
  return{
    agent:"Use captions only as much as this video needs. Decide from the footage.",
    dynamic:"Use dynamic, word-synced captions with faster chunking and selective emphasis. Keep them readable and out of the way of important visuals.",
    clean:"Use clean, calmer captions with simpler motion and restrained emphasis.",
    none:"Do not add captions unless I ask later."
  }[state.captions];
}

function soundInstruction(){
  return{
    agent:"Use your judgment for sound design. Quiet is valid.",
    heavy:"Use a lot of sound design when it supports the energy: clicks, pops, impacts, whooshes, transitions, and small UI sounds. Speech must stay clear and the sounds should still match the action.",
    balanced:"Use balanced sound design. Add useful clicks, pops, impacts, and whooshes to transitions and reveals, but do not accent every beat.",
    minimal:"Use very little added SFX. Accent only major transitions, reveals, or proof moments.",
    none:"Do not add sound effects."
  }[state.sfx];
}

function asrInstruction(){
  return{
    auto:"Use the best transcription option already available. Groq and Deepgram are both valid cloud choices; an installed local model is also fine. Ask before uploading private audio, making a paid call, or downloading a large model.",
    groq:"Prefer Groq for transcription. It is a fast Whisper-based cloud option. Use credentials already configured locally and ask before uploading private audio. Never ask me to paste an API key into chat.",
    deepgram:"Prefer Deepgram for transcription. It is a cloud speech-to-text option with detailed word timing. Use credentials already configured locally and ask before uploading private audio. Never ask me to paste an API key into chat.",
    local:"Keep transcription local. Reuse an installed local transcriber first. This keeps audio on the machine, but ask before downloading a model or other large dependency."
  }[state.asr];
}

function buildPrompt(){
  const goal=state.goal||"Find the strongest short-form edit in this footage.";
  const process=state.mode==="plan"
    ?"Before editing, show me a short plan for the cuts, pacing, and visual direction. Wait for my approval, then build the first draft."
    :"Make the first draft without an unnecessary planning checkpoint. Inspect the footage, use your judgment, and give me something concrete to react to.";
  const finish=state.finish==="preview"
    ?"Show me a playable or browser preview before final export and wait for my feedback."
    :"Finish the edit and export it in one go unless a real blocker requires my decision.";

  const lines=[
    "Edit this video using Bare Video.",
    "",
    "Bare Video repo:",
    "https://github.com/barestack-labs/bare-video",
    "",
    "Read .agents/skills/bare-video/SKILL.md and use it as the editing guide.",
    "",
    "VIDEO",
    state.video,
    "Goal: "+goal,
    "",
    "PROJECT SETUP",
    "Keep the original footage untouched. Put temporary work and outputs separately. Inspect what is already installed before downloading anything. Use FFmpeg directly for media work. Use HyperFrames when a browser composition, animated visual, or preview helps. Ask before large downloads, paid calls, global installs, or sending private footage to a cloud service.",
    "",
    "PROCESS",
    process,
    "",
    "VIDEO BUILDING BLOCKS",
    visualInstruction(),
    "",
    "CAPTIONS",
    captionInstruction(),
    "",
    "SOUND DESIGN",
    soundInstruction(),
    "",
    "TRANSCRIPTION",
    asrInstruction(),
    "",
    "EDITING PRINCIPLES",
    "- Judge cuts from meaning and delivery, not a silence threshold.",
    "- Keep useful pauses, reactions, emphasis, personality, and intentional repetition.",
    "- Prefer real screenshots, demos, repos, websites, or results over invented proof.",
    "- Let the footage stay simple when nothing else genuinely improves the moment.",
    "- Check the actual picture, audio, duration, and sync. A successful command is not enough.",
    "",
    "FINISH",
    finish
  ];

  if(state.skill){
    lines.push(
      "",
      "AFTER THIS EDIT",
      "After the edit works, offer to install or copy the Bare Video skill into the user-level skill location supported by my coding agent. Ask before changing global configuration."
    );
  }

  lines.push(
    "",
    "At the end, tell me what you changed, what you verified, and where the preview or final output is."
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