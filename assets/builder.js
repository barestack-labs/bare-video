const builder=document.querySelector("#build");
if(builder){
  const state={
    goal:"",
    reference:"",
    transcription:"faster",
    planning:"plan",
    theme:"product",
    visuals:["face","split","fullscreen","card","bigcard","stat","step","ui","cards","green"],
    improvise:true,
    pace:"active",
    captions:"punchy",
    sound:"balanced",
    cuts:"balanced",
    finish:"preview"
  };

  const $=selector=>builder.querySelector(selector);
  const $$=selector=>[...builder.querySelectorAll(selector)];

  const themeCopy={
    product:"Product Clean: white #fff, ink #0b0b0c, secondary #8a8a90, hairline #e4e4e8, black accent, tight sans headlines weight 800 letter-spacing -0.05em, no caps, cards radius 14px with a soft shadow, caption bottom 15%, 300 to 420ms ease-out motion. No second color.",
    creator:"Creator Utility: near-black #0d0d0f, white ink, lime accent #d8ff3e, wide grotesque headlines weight 850 uppercase letter-spacing -0.02em, light cards radius 8px, caption white uppercase with the emphasis word on a solid lime block, snappy 180 to 300ms motion.",
    data:"Data Editorial: warm paper #f2ede3, ink #1a1714, hairline #d9d0c1, rust accent #b4451f, serif headlines and numerals weight 800, cards radius 2px with hairlines, captions dark ink serif with no shadow, calm 400 to 600ms motion. Real numbers only; skip stat treatment when the video has no numbers.",
    tutorial:"Tutorial Steps: cool grey #eef2f8, ink #0f1620, blue accent #2f6bff, neutral sans headlines weight 800, step badges in mono uppercase, cards radius 12px, one action per card, captions dark ink kept clear of the element being clicked, 200 to 320ms motion that lands on the action.",
    minimal:"Bare Minimal: black #0a0a0a, white ink, white accent only, wide grotesque headlines weight 850 uppercase letter-spacing -0.03em, no card fills, 1px hairline only, radius 0, captions white with no highlight block, emphasis from scale and placement, almost no decorative motion."
  };

  const componentCopy={
    face:"Talking head: use the speaker as the main composition when delivery is the strongest visual.",
    split:"Split screen: combine the speaker with a real screen, screenshot, demo, image, or other useful visual. Either order is allowed: speaker on top with the information below, or the information on top with the speaker below. Choose by the way the face sits in frame and whether the viewer should read or watch first.",
    fullscreen:"Full-screen media: let a real screen, result, website, screenshot, image, or demo take over when it deserves the frame.",
    card:"Floating card: place a compact card over footage for a label, quote, proof point, image, UI detail, or short piece of information.",
    bigcard:"Big card: use a large card as a major composition, including oversized proof, a strong statement, UI, or a focal visual.",
    stat:"Stat or data card: present real numbers, percentages, progress, charts, or comparisons with clear hierarchy. Never invent data.",
    step:"Step card: show a numbered action, instruction, or stage with enough room for the viewer to understand what happens next.",
    ui:"Screenshot or UI card: frame real interface proof clearly, either as a card, crop, device-like frame, or focused screen region.",
    cards:"Multiple cards: arrange several useful cards around or beside the subject when the content benefits from comparison, accumulation, options, or spatial storytelling.",
    green:"Green-screen layout: place the keyed or isolated speaker over real supporting media or a designed composition when the footage and available tools support it."
  };

  const transcriptionCopy={
    faster:"Use Faster Whisper locally for transcription. Check whether it and a suitable model already exist before downloading anything. Prefer word-level timestamps.",
    groq:"Use Groq for transcription. First check GROQ_API_KEY in the project .env or current environment. If it is missing, create the project .env if needed and open it in my normal text editor; on Windows, use Notepad. Put a GROQ_API_KEY= line in the file and ask me to save the key there. Never ask me to paste the key into chat. After I save it, continue and prefer detailed word timing when supported. If I skip cloud setup, offer Faster Whisper instead of pretending Groq is configured.",
    deepgram:"Use Deepgram for transcription. First check DEEPGRAM_API_KEY in the project .env or current environment. If it is missing, create the project .env if needed and open it in my normal text editor; on Windows, use Notepad. Put a DEEPGRAM_API_KEY= line in the file and ask me to save the key there. Never ask me to paste the key into chat. After I save it, continue and preserve detailed word timing when available. If I skip cloud setup, offer Faster Whisper instead of pretending Deepgram is configured.",
    existing:"Reuse the verified transcript I provide. Prefer word-level timestamps. If you cannot locate it, ask me for it before speech-driven editing."
  };

  const planningCopy={
    plan:"After transcription and footage inspection, show me a compact edit plan before the heavy build. Cover the hook, retained story, important cuts, visual beats, caption treatment, sound cues, and whether HyperFrames would materially help. Let me change the plan before the draft.",
    draft:"After transcription and footage inspection, make the first draft without a planning checkpoint. Make deliberate choices about the hook, cuts, visual beats, captions, and sound, then give me a real preview to react to."
  };

  const paceCopy={
    active:"Use an active short-form pace. Give meaningful phrases a useful visual response when it helps, but do not animate filler words mechanically.",
    balanced:"Use a balanced visual pace. Change presentation when it improves understanding, supports proof, or prevents a dead stretch.",
    calm:"Use a calm visual pace. Let strong footage breathe and change the composition only when the content benefits."
  };

  const captionCopy={
    punchy:"Use precise word-timed punchy captions with short readable chunks and deliberate emphasis. Keep captions away from faces and important proof.",
    clean:"Use precise clean captions with calmer chunking, restrained motion, and selective emphasis.",
    none:"Do not burn captions into the video. The transcript should still guide cuts and timing."
  };

  const soundCopy={
    lots:"Use frequent but purposeful sound design tied to visible actions, reveals, and transitions. Keep speech dominant.",
    balanced:"Use selective clicks, taps, impacts, and soft whooshes for real actions, reveals, and transitions. Keep speech dominant.",
    minimal:"Use added sound only for major reveals, transitions, proof moments, or important actions.",
    none:"Do not add sound effects."
  };

  const cutCopy={
    tight:"Cut tight. Remove every silence longer than 300ms, remove repeated takes, filler and false starts, and keep the speech density high. Do not cut mid-word and do not remove the breath a line needs to land.",
    balanced:"Cut by meaning. Remove dead air longer than about 800ms when it serves the edit, plus obvious false starts, but keep pauses that carry emphasis or let a point sit. Silence removal serves the story, it does not set the pace.",
    loose:"Cut loose. Keep the natural rhythm, breaths, and pauses. Remove only dead air longer than about 1.5 seconds or a take that is clearly unusable."
  };

  function referenceText(){
    const reference=state.reference.trim();
    if(reference){
      return "I am giving you this reference: "+reference+". Open the real file, image, or link and look at it before planning. Let it override the starter style and components where it clearly differs, and tell me which parts you copied.";
    }
    return "If I mention a reference video, image, channel, or screenshot, study the real thing before planning and let it override the starter style where it clearly differs. If I do not give you one, do not invent it.";
  }

  function buildPrompt(){
    const selected=state.visuals.map(key=>componentCopy[key]).filter(Boolean);
    const goal=state.goal.trim()||"Make the strongest truthful short-form edit from the video I give you while keeping my meaning and personality.";
    return [
      "Edit my video using Bare Video.",
      "",
      "Bare Video repo: https://github.com/barestack-labs/bare-video",
      "Read .agents/skills/bare-video/SKILL.md first and use it as the editing guide.",
      "If that file is not in this project, read it from the repo link above before you touch the media.",
      "",
      "GOAL",
      goal,
      "",
      "REFERENCE",
      referenceText(),
      "",
      "TRANSCRIPTION",
      transcriptionCopy[state.transcription],
      "",
      "WORK WITH ME",
      planningCopy[state.planning],
      "",
      "STARTING STYLE",
      themeCopy[state.theme],
      "This is a visual baseline, not a rigid template. My instructions and any real reference I provide can override any part of it.",
      "",
      "STARTER COMPONENTS I LIKE",
      ...selected.map(item=>"- "+item),
      state.improvise
        ?"These are ingredients, not restrictions. Resize, reposition, combine, restyle, repeat, or create another composition when the footage, reference, or my instruction calls for it."
        :"Prefer these selected components. You may adapt their size and placement, but stay close to this kit unless my footage or direct instruction clearly requires something else.",
      "",
      "VISUAL PACE",
      paceCopy[state.pace],
      "",
      "CAPTIONS",
      captionCopy[state.captions],
      "",
      "SOUND DESIGN",
      soundCopy[state.sound],
      "",
      "CUTS",
      cutCopy[state.cuts],
      "",
      "TOOLS",
      "Use FFmpeg directly for normal media work. After the transcript and direction are clear, use HyperFrames only if it materially improves composition, motion graphics, or previewing. If it is missing and would help, ask before adding it locally to the project.",
      "",
      "EDITING RULES",
      "- Make cuts from meaning, delivery, and story, not silence thresholds alone.",
      "- Anchor visual changes, captions, and sound to the words or actions they support.",
      "- Prefer real screenshots, demos, websites, results, logos, images, and footage over invented proof.",
      "- Treat the starter components as a kit you can creatively adapt, not a finite template library.",
      "- My direct feedback and real references override the starter style and component defaults.",
      "- Do not copy protected branding, watermarks, or another creator's identity from a reference. Recreate the useful visual logic with my own assets.",
      "- Never invent data, proof, screenshots, assets, or results.",
      "- Check picture, audio, caption timing, duration, and A/V sync before claiming the edit works.",
      "",
      "FIRST OUTPUT",
      state.finish==="preview"
        ?"Show me a playable draft or browser preview before final export. Apply my feedback, then export after approval."
        :"Build, self-check, and export in one pass unless a real blocker or missing asset requires my decision.",
      "",
      "At the end, tell me what you changed, what you actually verified, which tools you used, and where the preview or final output is."
    ].join("\n");
  }

  function sync(){
    $$(".segmented [data-key]").forEach(button=>{
      const active=state[button.dataset.key]===button.dataset.value;
      button.classList.toggle("is-selected",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });
    $$("[data-theme]").forEach(button=>{
      const active=state.theme===button.dataset.theme;
      button.classList.toggle("is-selected",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });
    $$("[data-visual]").forEach(button=>{
      const active=state.visuals.includes(button.dataset.visual);
      button.classList.toggle("is-selected",active);
      button.setAttribute("aria-pressed",active?"true":"false");
    });
    $("#agent-improvise").checked=state.improvise;

    const cloud=state.transcription==="groq"||state.transcription==="deepgram";
    const cloudHelp=$("#cloud-key-help");
    if(cloudHelp){
      cloudHelp.hidden=!cloud;
      if(cloud){
        const isGroq=state.transcription==="groq";
        $("#cloud-key-title").textContent=isGroq?"Groq key":"Deepgram key";
        $("#cloud-key-line").textContent=isGroq?"GROQ_API_KEY=":"DEEPGRAM_API_KEY=";
      }
    }

    $("#builder-prompt").value=buildPrompt();
    $("#visual-count").textContent=state.visuals.length+" selected";
    paintThemePreviews();
  }

  function paintThemePreviews(){
    if(typeof window.bvPhone!=="function")return;
    $$("[data-theme-preview]").forEach(el=>{
      const key=el.dataset.themePreview;
      if(el.dataset.painted===key)return;
      el.innerHTML=window.bvPhone("face",key);
      el.dataset.painted=key;
    });
  }

  $$(".segmented [data-key]").forEach(button=>button.addEventListener("click",()=>{state[button.dataset.key]=button.dataset.value;sync();}));
  $$("[data-theme]").forEach(button=>button.addEventListener("click",()=>{state.theme=button.dataset.theme;sync();}));
  $$("[data-visual]").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.visual;
    state.visuals=state.visuals.includes(key)?state.visuals.filter(item=>item!==key):[...state.visuals,key];
    if(state.visuals.length===0){
      state.visuals=[key];
      $("#visual-help").textContent="Keep at least one component selected. The agent needs at least one composition to start from.";
    }else{
      $("#visual-help").textContent="These are starting components, not a strict allow-list.";
    }
    sync();
  }));
  $("#agent-improvise").addEventListener("change",event=>{state.improvise=event.target.checked;sync();});
  $("#builder-goal").addEventListener("input",event=>{state.goal=event.target.value;sync();});
  $("#builder-reference").addEventListener("input",event=>{state.reference=event.target.value;sync();});

  $("#copy-builder-prompt").addEventListener("click",async()=>{
    const prompt=$("#builder-prompt");
    let copied=false;
    try{await navigator.clipboard.writeText(prompt.value);copied=true;}
    catch{prompt.focus();prompt.select();try{copied=document.execCommand("copy");}catch{}}
    $("#builder-copy-status").textContent=copied?"Copied. Paste it into the coding agent working with your video.":"Copy was blocked. The prompt is selected, press Ctrl+C.";
  });
  sync();
}
