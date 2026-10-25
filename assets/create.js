const state={experience:"beginner",mode:"plan",style:"bare",captions:"dynamic",sfx:"restrained",asr:"auto",approval:"preview"};
const labels={
experience:{beginner:"Dedicated project folder",experienced:"Existing workspace"},
mode:{plan:"Plan with me",oneshot:"One-shot first draft"},
style:{bare:"Bare Default",captions:"Captions only",tutorial:"Tutorial / proof-heavy",face:"Face-first minimal",agent:"Agent decides",reference:"My own reference"},
captions:{dynamic:"Dynamic",clean:"Clean",none:"No captions"},
sfx:{restrained:"Restrained",minimal:"Minimal",none:"None"},
asr:{auto:"Automatic",groq:"Groq",deepgram:"Deepgram",local:"Local only"},
approval:{preview:"Preview first",final:"Finish in one go"}};

const sections=[
{id:"setup",num:"01",label:"Setup",title:"How are you using Bare Video?",hint:"A dedicated folder is strongly recommended for beginners.",group:"experience",choices:[
["beginner","New dedicated folder","One folder for the video, repo, references, secrets, work files, and output."],
["experienced","I know my setup","Use Bare Video inside an existing workspace or keep the skill around for repeat use."]
],fields:true},
{id:"mode",num:"02",label:"Edit mode",title:"How much should the agent decide on its own?",group:"mode",choices:[
["plan","Plan with me","Show the proposed cuts and visual beats first. Build after I approve."],
["oneshot","One-shot the first draft","Build the first browser preview without stopping for plan approval."]
]},
{id:"style",num:"03",label:"Visual direction",title:"What should the video feel like?",group:"style",choices:[
["bare","Bare Default","Apple-inspired editorial pacing with Face, Split, Proof, Editorial, UI, and occasional Collage."],
["captions","Captions only","Keep footage full-screen. Use cuts and captions, not routine graphic scenes."],
["tutorial","Tutorial / proof-heavy","Prioritize screenshots, screen recordings, demos, and real proof."],
["face","Face-first minimal","Stay on the speaker and interrupt only when a visual is genuinely more useful."],
["agent","Let the agent decide","Choose the visual mix from the transcript, footage, and Bare Video rules."],
["reference","I have my own reference","Use videos, screenshots, or assets I place in references/ as style guidance."]
]},
{id:"captions",num:"04",label:"Captions",title:"How much text should live on screen?",group:"captions",cols:"three",choices:[
["dynamic","Dynamic","Short word-synced chunks with restrained emphasis."],
["clean","Clean","Longer, calmer caption chunks with less movement."],
["none","No captions","Only use on-screen text when it materially helps."]
]},
{id:"sound",num:"05",label:"Sound design",title:"How present should SFX be?",group:"sfx",cols:"three",choices:[
["restrained","Restrained","Contextual whooshes, clicks, impacts, and success sounds."],
["minimal","Minimal","Accent only major layout changes or payoffs."],
["none","None","No added SFX unless I ask later."]
]},
{id:"asr",num:"06",label:"Transcription",title:"How should the agent get word timings?",group:"asr",choices:[
["auto","Automatic","Use configured Groq first, then Deepgram, then offer the local fallback."],
["groq","Groq","Create/open the project .env if the key is missing."],
["deepgram","Deepgram","Create/open the project .env if the key is missing."],
["local","Local only","Use faster-whisper and explain the model download before doing it."]
],env:true},
{id:"finish",num:"07",label:"Finish",title:"What should happen after the first edit?",group:"approval",choices:[
["preview","Preview first","Open the browser preview and wait for my feedback before final rendering."],
["final","Finish it in one go","Preview, self-check, and export unless an important decision is genuinely ambiguous."]
],finish:true}
];

const root=document.querySelector("#questions");
root.innerHTML=sections.map(s=>\`<section class="question" id="\${s.id}" data-section="\${s.id}"><span class="num">\${s.num}</span><p class="eyebrow">\${s.label}</p><h2>\${s.title}</h2>\${s.hint?\`<p class="hint">\${s.hint}</p>\`:""}<div class="choices \${s.cols||""}" data-group="\${s.group}">\${s.choices.map((c,i)=>\`<button class="choice \${i===0?"selected":""}" data-value="\${c[0]}"><b>\${c[1]}</b><span>\${c[2]}</span></button>\`).join("")}</div>\${s.fields?\`<label class="field"><span>Video path</span><input id="video-path" value="./input/video.mp4"></label><label class="field"><span>What are you making? <small>optional</small></span><textarea id="goal" rows="3" placeholder="e.g. 45-second tutorial about a free AI coding tool"></textarea></label>\`:""}\${s.env?\`<div class="env"><b>Secrets stay out of the prompt.</b><p>If a cloud key is missing, the agent creates a project-local <code>.env</code> from the example and opens it in your editor. You paste the key there, not into chat.</p></div>\`:""}\${s.finish?\`<label class="toggle"><input id="skill-install" type="checkbox"><span><b>I want to reuse Bare Video often.</b><small>Tell the agent to offer installing/copying the Bare Video skill into its supported user-level skill location. Ask before changing global configuration.</small></span></label><button class="primary" id="generate">Generate my prompt</button>\`:""}</section>\`).join("");

document.querySelectorAll("[data-group]").forEach(group=>group.addEventListener("click",e=>{const choice=e.target.closest(".choice");if(!choice)return;state[group.dataset.group]=choice.dataset.value;group.querySelectorAll(".choice").forEach(x=>x.classList.toggle("selected",x===choice));renderSummary()}));

function renderSummary(){
 const rows=[["Setup",labels.experience[state.experience]],["Edit",labels.mode[state.mode]],["Look",labels.style[state.style]],["Captions",labels.captions[state.captions]],["SFX",labels.sfx[state.sfx]],["ASR",labels.asr[state.asr]],["Finish",labels.approval[state.approval]]];
 document.querySelector("#summary").innerHTML=rows.map(r=>\`<div class="summary-row"><small>\${r[0]}</small><b>\${r[1]}</b></div>\`).join("")
}
renderSummary();

const styleText=()=>({
bare:"Use Bare Default: Apple-inspired editorial restraint. Face is the baseline. Use Split, Float, Proof, Editorial, UI, and Collage only when the content gives them a reason to exist.",
captions:"Keep the original footage full-screen most of the time. Use cuts and captions as the primary edit language. Avoid routine full-screen graphic scenes.",
tutorial:"Make this tutorial/proof-heavy. Prioritize real screen recordings, screenshots, demos, repos, and results. Prefer Split and Proof layouts when useful.",
face:"Keep this face-first and minimal. Stay on the speaker for most of the video and interrupt only when a visual is genuinely more useful.",
agent:"Choose the visual mix yourself using the Bare Video rules. Do not rotate layouts for variety; choose them from the meaning of each beat.",
reference:"Inspect ./references/ and derive a style grammar: layout frequency, framing, captions, motion cadence, graphic density, SFX density, and pacing. Approximate that language with Bare Video components without copying protected branding or assets."
}[state.style]);

const captionText=()=>({dynamic:"Use word-synced captions in short chunks, usually 2–3 words and at most 4. Keep emphasis restrained and move captions when layouts would collide with them.",clean:"Use calmer captions with longer readable chunks and minimal animation.",none:"Do not add routine captions. Use on-screen text only when it materially improves the edit."}[state.captions]);
const sfxText=()=>({restrained:"Use contextual SFX from the Bare Video event mapping. Speech always wins.",minimal:"Use very little SFX. Accent only major layout changes, proof reveals, or the payoff.",none:"Do not add SFX unless I ask later."}[state.sfx]);

function asrText(){
 const env="Never ask me to paste API keys into chat. If a cloud key is required and missing, create a project-local .env using the variable names from ./bare-video/examples/bare-video.env.example, ensure it is ignored by Git, open it in my local editor, and tell me which variable to fill.";
 return {auto:\`Choose transcription automatically. Prefer an existing GROQ_API_KEY, then DEEPGRAM_API_KEY. If neither exists, ask whether I want cloud setup or local faster-whisper. \${env} Before downloading a local model, explain its approximate size, RAM/storage impact, and project-local destination.\`,groq:\`Use Groq when the current Bare Video implementation supports it. \${env}\`,deepgram:\`Use Deepgram when the current Bare Video implementation supports it. \${env}\`,local:"Use local faster-whisper only. Explain model size, RAM/storage impact, and project-local destination before downloading anything. Ask permission before a large download."}[state.asr]
}

function setupText(){
 if(state.experience==="experienced") return "I am comfortable with my workspace. Do not reorganize it just to match a beginner template. Find the Bare Video repo, read AGENTS.md, and use .agents/skills/bare-video/SKILL.md when your environment supports repo-local skills. Reuse existing tools first.";
 return "Treat this as a beginner project. Keep all new work inside the current dedicated video-project folder. The Bare Video repo should live at ./bare-video/. Recommended folders are ./input/, ./references/, ./assets/, ./runtime/, ./workspace/, and ./output/. Run python ./bare-video/scripts/doctor.py before installing anything. Reuse existing Node, FFmpeg, ffprobe, Chrome/Chromium, and Python. Prefer project-local runtimes/models under ./runtime/ when something is missing.";
}

function buildPrompt(){
 const video=document.querySelector("#video-path").value.trim()||"./input/video.mp4";
 const goal=document.querySelector("#goal").value.trim();
 const plan=state.mode==="plan"?"Before building the edit, show me a concise beat plan with proposed cuts and layout choices. Wait for my approval before building the first preview.":"Build the first preview in one shot without stopping for beat-plan approval. Self-check it before showing me the preview.";
 const finish=state.approval==="preview"?"Open the browser preview and stop there. Wait for my feedback before final rendering/export.":"Open/check the browser preview yourself, run relevant QA, and export the final file in the same run unless an important decision is genuinely ambiguous.";
 const skill=document.querySelector("#skill-install").checked?"After this project works, offer to install/copy the Bare Video skill into the user-level skill location supported by my coding agent so I can reuse it later. Ask before changing any global configuration.":"";
 return \`Set up and edit this video using Bare Video.

Bare Video repo: https://github.com/barestack-labs/bare-video
Website: https://shorts.paulablaza.com/

First inspect the current repository and verify what is actually implemented. Do not pretend a planned feature exists if the code is not there yet. Read ./bare-video/AGENTS.md and use ./bare-video/.agents/skills/bare-video/SKILL.md when supported.

SETUP
\${setupText()}
Ask before credentials, paid operations, destructive changes, global installs, or unexpectedly large downloads.

VIDEO
Path: \${video}\${goal?\`\\nGoal: \${goal}\`:""}

EDIT MODE
\${plan}

VISUAL DIRECTION
\${styleText()}

CAPTIONS
\${captionText()}

SOUND
\${sfxText()}

TRANSCRIPTION / ENV
\${asrText()}

EDITING RULES
- Silence is a cut candidate, not an automatic deletion.
- Remove dead air, obvious abandoned takes, unnecessary repeats, and setup mistakes.
- Keep meaningful thinking, emphasis, reactions, comedy, and useful demonstration pauses.
- Show real screenshots, recordings, repos, websites, or results before inventing decorative cards.
- Keep source ranges ordered and non-overlapping.
- Choose layouts by meaning, not by rotation.
- Keep motion restrained and purposeful. Avoid generic AI-video clutter.
- Keep secrets out of logs, generated HTML, screenshots, and commits.

FINISH
\${finish}
\${skill}

At the end of this run, tell me:
1. what you changed,
2. what you verified,
3. any dependency/download you added,
4. where the preview or final output is located.\`;
}

const guide=document.querySelector("#guide"),result=document.querySelector("#result"),prompt=document.querySelector("#prompt");
document.querySelectorAll("[data-guide]").forEach(x=>x.addEventListener("click",()=>guide.showModal()));
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>x.closest("dialog").close()));
const openResult=()=>{prompt.value=buildPrompt();result.showModal()};
document.querySelector("#generate").addEventListener("click",openResult);
document.querySelector("#generate-side").addEventListener("click",openResult);
document.querySelector("#copy").addEventListener("click",async()=>{await navigator.clipboard.writeText(prompt.value);const t=document.querySelector("#toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1400)});

const qs=[...document.querySelectorAll(".question")],links=[...document.querySelectorAll(".rail a")],meter=document.querySelector("#meter");
const obs=new IntersectionObserver(entries=>{const hit=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!hit)return;const i=qs.indexOf(hit.target);links.forEach((l,n)=>l.classList.toggle("active",n===i));meter.style.width=\`\${((i+1)/qs.length)*100}%\`},{rootMargin:"-30% 0px -50% 0px",threshold:[0,.25,.5]});
qs.forEach(q=>obs.observe(q));