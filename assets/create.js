const state={goal:"",video:"./input/video.mp4",mode:"draft",style:"agent",captions:"agent",sfx:"agent",asr:"auto",finish:"preview",skill:false};
const KEY="bare-video-configurator-v3";
const steps=[...document.querySelectorAll(".step")];
let current=0;
const $=s=>document.querySelector(s);

function load(){
  try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&typeof saved==="object")Object.assign(state,saved)}catch{}
  $("#goal").value=state.goal||"";
  $("#video-path").value=state.video||"./input/video.mp4";
  $("#skill-install").checked=!!state.skill;
}
function save(){
  state.goal=$("#goal").value.trim();
  state.video=$("#video-path").value.trim()||"./input/video.mp4";
  state.skill=$("#skill-install").checked;
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
}
function syncSelections(){
  document.querySelectorAll("[data-key]").forEach(group=>{
    const key=group.dataset.key;
    group.querySelectorAll("[data-value]").forEach(button=>button.classList.toggle("is-selected",button.dataset.value===state[key]));
  });
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
function choose(group,button){
  state[group.dataset.key]=button.dataset.value;
  syncSelections();
  save();
}
document.querySelectorAll("[data-key]").forEach(group=>group.addEventListener("click",event=>{
  const button=event.target.closest("[data-value]");
  if(button)choose(group,button);
}));
$("#goal").addEventListener("input",save);
$("#video-path").addEventListener("input",save);
$("#skill-install").addEventListener("change",save);
$("#back").addEventListener("click",()=>{save();if(current>0){current--;renderStep()}});
$("#next").addEventListener("click",()=>{save();if(current<steps.length-1){current++;renderStep();return}showResult()});
$("#start-over").addEventListener("click",()=>{
  Object.assign(state,{goal:"",video:"./input/video.mp4",mode:"draft",style:"agent",captions:"agent",sfx:"agent",asr:"auto",finish:"preview",skill:false});
  try{localStorage.removeItem(KEY)}catch{}
  current=0;load();syncSelections();renderStep();
});

function styleInstruction(){return{
  agent:"Use your judgment for the visual language. Start with the footage and only add captions, screens, screenshots, designed scenes, or motion when they improve the video.",
  bare:"Keep the visual language clean, restrained, and premium. Use the footage as the baseline and add editorial moments only when they earn the frame.",
  captions:"Keep the footage full-screen most of the time. Let cuts and captions carry the edit instead of routine full-screen graphics.",
  tutorial:"Make this tutorial/proof-heavy. Prefer real screen recordings, screenshots, demos, repos, and results over decorative graphics.",
  face:"Keep this face-first. Stay on the speaker unless a real visual is more useful.",
  reference:"Inspect ./references/ and borrow its editing language: pacing, framing, caption treatment, motion, density, and sound. Do not copy protected branding or assets."
}[state.style]}
function captionInstruction(){return{
  agent:"Use captions only as much as this video needs.",
  dynamic:"Use tighter, energetic captions with selective emphasis. Keep them readable and out of the way of important visuals.",
  clean:"Use calm, simple captions with minimal animation.",
  none:"Do not add captions unless I ask later."
}[state.captions]}
function soundInstruction(){return{
  agent:"Use your judgment for sound design. Quiet is valid.",
  restrained:"Use restrained sound design that supports transitions or reveals without competing with speech.",
  minimal:"Use very little added SFX, only on major moments.",
  none:"Do not add SFX."
}[state.sfx]}
function asrInstruction(){return{
  auto:"If a transcript helps, reuse an already configured transcription tool. Groq and Deepgram are both valid cloud options. Ask before uploading private audio, making a paid call, or downloading a large local model.",
  groq:"If a transcript helps, prefer Groq. Use existing local credentials or ask me to configure them. Never ask me to paste an API key into chat.",
  deepgram:"If a transcript helps, prefer Deepgram. Use existing local credentials or ask me to configure them. Never ask me to paste an API key into chat.",
  local:"Keep transcription local. Reuse an installed local transcriber first and ask before downloading a model or large dependency."
}[state.asr]}

function buildPrompt(){
  const goal=state.goal||"Find the strongest edit in this footage.";
  const process=state.mode==="plan"
    ?"Before editing, show me a short plan for the cuts and visual direction. Wait for my approval, then build the draft."
    :"Make a first draft without an unnecessary planning checkpoint. Use your judgment and give me something concrete to react to.";
  const finish=state.finish==="preview"
    ?"Show me a playable or browser preview before final export and wait for my feedback."
    :"Finish the edit and export it in one go unless a real blocker requires my decision.";
  const lines=[
    "Edit this video using Bare Video.",
    "",
    "Bare Video repo:",
    "https://github.com/barestack-labs/bare-video",
    "",
    "Read .agents/skills/bare-video/SKILL.md. Bare Video is guidance, not another editing engine. Use native tools directly.",
    "",
    "VIDEO",
    state.video,
    "Goal: "+goal,
    "",
    "SETUP",
    "Keep the original footage untouched and write work files and outputs separately. Inspect what is already installed before downloading anything. Use FFmpeg directly for media work. Use HyperFrames when a browser composition, animation, or preview helps. Ask before large downloads, paid calls, global installs, or sending private footage to a cloud service.",
    "",
    "PROCESS",
    process,
    "",
    "VISUAL DIRECTION",
    styleInstruction(),
    "",
    "CAPTIONS",
    captionInstruction(),
    "",
    "SOUND",
    soundInstruction(),
    "",
    "TRANSCRIPTION",
    asrInstruction(),
    "",
    "EDITING PRINCIPLES",
    "- Judge cuts from meaning and delivery, not a silence threshold.",
    "- Keep useful pauses, reactions, emphasis, personality, and intentional repetition.",
    "- Prefer real screenshots, demos, repos, websites, or results over invented proof.",
    "- Check the actual picture, audio, duration, and sync. A successful command is not enough.",
    "",
    "FINISH",
    finish
  ];
  if(state.skill){
    lines.push("","After this edit works, offer to install/copy the Bare Video skill into the user-level skill location supported by my coding agent. Ask before changing global configuration.");
  }
  lines.push("","At the end, tell me what you changed, what you verified, and where the preview or final output is.");
  return lines.join("\n");
}
function showResult(){
  $("#prompt").value=buildPrompt();
  $("#result").classList.add("is-visible");
  $("#result").setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
$("#edit").addEventListener("click",()=>{
  $("#result").classList.remove("is-visible");
  $("#result").setAttribute("aria-hidden","true");
  document.body.style.overflow="";
});
$("#copy").addEventListener("click",async()=>{
  const prompt=$("#prompt");
  let copied=false;
  try{await navigator.clipboard.writeText(prompt.value);copied=true}catch{
    prompt.focus();prompt.select();
    try{copied=document.execCommand("copy")}catch{}
  }
  $("#copy-status").textContent=copied?"Copied. Paste it into your coding agent.":"Copy was blocked. The prompt is selected, press Ctrl+C.";
});
document.addEventListener("keydown",event=>{
  if($("#result").classList.contains("is-visible")){if(event.key==="Escape")$("#edit").click();return}
  if(event.key==="ArrowLeft"&&current>0)$("#back").click();
  if(event.key==="ArrowRight"&&current<steps.length-1&&document.activeElement.tagName!=="TEXTAREA"&&document.activeElement.tagName!=="INPUT")$("#next").click();
});

load();
syncSelections();
const fromHash=Number(location.hash.replace("#",""));
if(Number.isInteger(fromHash)&&fromHash>=1&&fromHash<=steps.length)current=fromHash-1;
renderStep();