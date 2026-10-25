const builder=document.querySelector("#build");
if(builder){
  const state={
    goal:"",
    transcription:"faster",
    planning:"plan",
    theme:"product",
    visuals:["face","split","overlay","proof"],
    pace:"active",
    captions:"punchy",
    sound:"balanced",
    finish:"preview"
  };

  const $=selector=>builder.querySelector(selector);
  const $$=selector=>[...builder.querySelectorAll(selector)];

  const themeCopy={
    product:"Product Clean: polished white, black, and soft-gray composition with generous negative space, crisp product or UI cards, controlled motion, selective accent color, and occasional editorial type contrast. Proof should feel deliberate and premium rather than busy.",
    creator:"Creator Utility: practical creator-style editing with the speaker kept present, bold readable captions, screen recordings and UI proof appearing quickly, useful labels/cards, selective keyword color, and fast transitions that prioritize clarity.",
    data:"Data Editorial: editorial information design with strong hierarchy, data cards, progress bars, percentages, charts or counters when real data exists, restrained warm or muted accent colors, and a calmer mix of serif-style editorial moments with clean sans-serif UI.",
    tutorial:"Tutorial Steps: instructional editing with obvious step labels, screen takeovers, callouts, cursor or UI emphasis, high-contrast captions, and minimal decoration. The viewer should always know what to click, read, or do next.",
    minimal:"Bare Minimal: stripped-back short-form editing with strong talking-head framing, clean black-and-white typography, simple proof, purposeful crops or zooms, and very little decorative motion. Keep only what improves the point."
  };

  const visualCopy={
    face:"Face-first: keep the speaker full-screen when delivery is the strongest visual.",
    split:"Split-screen: show the speaker together with a real screen, screenshot, demo, or supporting image.",
    overlay:"Light overlays: place small real screenshots, labels, logos, cards, stats, or supporting images over the footage.",
    proof:"Full-screen proof: let a real result, repo, website, screenshot, demo, or supporting image take over when the viewer needs to see it clearly."
  };

  const transcriptionCopy={
    faster:"Use Faster Whisper locally for transcription. Check whether it and a suitable model already exist before downloading anything. Prefer word-level timestamps.",
    groq:"Use Groq for transcription with credentials already configured locally. Prefer word-level timing when the current API supports it. Never ask me to paste an API key into chat.",
    deepgram:"Use Deepgram for transcription with credentials already configured locally. Preserve detailed word timing when available. Never ask me to paste an API key into chat.",
    existing:"Reuse the verified transcript I provide instead of creating a new one. Prefer word-level timestamps. If you cannot locate the transcript, ask me for it before planning speech-driven cuts."
  };

  const planningCopy={
    plan:"After transcription and footage inspection, show me a compact edit plan before the heavy build. Include the hook, retained story, important cuts, visual beats tied to spoken moments, caption treatment, sound cues, and whether HyperFrames would materially help. Let me change the plan before you build the draft.",
    draft:"After transcription and footage inspection, make the first draft without a planning approval checkpoint. Still make deliberate decisions about the hook, cuts, visual beats, captions, and sound. Give me a real preview to react to."
  };

  const paceCopy={
    active:"Use an active short-form pace. Most meaningful spoken phrases should receive a useful visible response, such as a layout change, relevant proof, a real overlay, a purposeful crop or motion change, or caption emphasis. Do not animate filler words mechanically.",
    balanced:"Use a balanced visual pace. Change presentation when it improves understanding, supports proof, or prevents a dead stretch. Let strong talking-head delivery stay on screen when it works.",
    calm:"Use a calm visual pace. Let the speaker stay on screen for longer stretches and add visual changes only when the content clearly benefits."
  };

  const captionCopy={
    punchy:"Use precise word-timed punchy captions with short readable chunks and deliberate emphasis on the useful word or phrase. Keep captions away from the speaker's mouth and important UI or proof.",
    clean:"Use precise clean captions with calmer chunking, restrained motion, and selective emphasis. Keep them away from important UI, proof, and the speaker's mouth.",
    none:"Do not burn captions into the video. The transcript should still guide cuts and timing."
  };

  const soundCopy={
    lots:"Use lots of purposeful sound design. Add varied clicks, taps, impacts, soft whooshes, transitions, and UI sounds when they match visible actions. Keep speech dominant and do not turn repeated sounds into a rhythm track.",
    balanced:"Use balanced sound design. Add useful clicks, taps, impacts, and soft whooshes to real actions, reveals, and transitions, but do not accent every cut. Keep speech dominant.",
    minimal:"Use minimal added sound effects. Accent only major reveals, transitions, proof moments, or important on-screen actions.",
    none:"Do not add sound effects."
  };

  function buildPrompt(){
    const selected=state.visuals.map(key=>visualCopy[key]).filter(Boolean);
    const goal=state.goal.trim()||"Make the strongest truthful short-form edit from the video I point you to while keeping my meaning and personality.";

    return [
      "Edit my video using Bare Video.",
      "",
      "Bare Video repo:",
      "https://github.com/barestack-labs/bare-video",
      "",
      "Read .agents/skills/bare-video/SKILL.md first and use it as the editing guide.",
      "",
      "PROJECT",
      "Work inside the video project folder I opened. Before doing media work, make sure I have pointed you to the exact video file to edit. If I have not, ask me which video file to use. Keep the original footage untouched and put temporary work and outputs separately.",
      "If I provide reference videos, screenshots, images, logos, or other assets, inspect the real files and use them as direction. Do not invent missing proof or assets.",
      "",
      "GOAL",
      goal,
      "",
      "TRANSCRIPTION",
      transcriptionCopy[state.transcription],
      "",
      "WORK WITH ME",
      planningCopy[state.planning],
      "",
      "EDITING THEME",
      themeCopy[state.theme],
      "Treat this as the primary editing language, not a rigid template. Adapt it to the footage and my feedback. A reference I provide can override specific theme details.",
      "",
      "ALLOWED VISUAL BUILDING BLOCKS",
      ...selected.map(item=>"- "+item),
      "Use only these enabled building blocks. Choose them by meaning, not by rotation.",
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
      "TOOLS",
      "Use FFmpeg directly for normal media work. After the transcript and edit direction are clear, decide whether HyperFrames would materially improve composition, motion graphics, or browser preview. If FFmpeg alone is enough, skip HyperFrames. If HyperFrames would help and is missing from this project, ask before adding it locally here. Do not install it globally by default.",
      "",
      "EDITING RULES",
      "- Make cuts from meaning, delivery, and story, not a silence threshold alone.",
      "- Anchor visual changes, captions, and sound cues to the words or actions they support.",
      "- Prefer real screenshots, demos, websites, results, logos, images, and footage over invented proof.",
      "- My direct feedback and any reference I provide override the starter theme.",
      "- Check the actual picture, audio, caption timing, duration, and A/V sync before claiming the edit works.",
      "",
      "FIRST OUTPUT",
      state.finish==="preview"
        ?"Show me a playable draft or browser preview before final export. Wait for my feedback, apply the changes, then export after approval."
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

    $("#builder-prompt").value=buildPrompt();
    $("#visual-count").textContent=state.visuals.length+" of 4 enabled";
  }

  $$(".segmented [data-key]").forEach(button=>{
    button.addEventListener("click",()=>{
      state[button.dataset.key]=button.dataset.value;
      sync();
    });
  });

  $$("[data-theme]").forEach(button=>{
    button.addEventListener("click",()=>{
      state.theme=button.dataset.theme;
      sync();
    });
  });

  $$("[data-visual]").forEach(button=>{
    button.addEventListener("click",()=>{
      const key=button.dataset.visual;
      if(state.visuals.includes(key)){
        if(state.visuals.length===1){
          $("#visual-help").textContent="Keep at least one building block enabled.";
          return;
        }
        state.visuals=state.visuals.filter(item=>item!==key);
      }else{
        state.visuals=[...state.visuals,key];
      }
      $("#visual-help").textContent="Enable only the visual blocks you want the agent to use.";
      sync();
    });
  });

  $("#builder-goal").addEventListener("input",event=>{
    state.goal=event.target.value;
    sync();
  });

  $("#copy-builder-prompt").addEventListener("click",async()=>{
    const prompt=$("#builder-prompt");
    let copied=false;
    try{
      await navigator.clipboard.writeText(prompt.value);
      copied=true;
    }catch{
      prompt.focus();
      prompt.select();
      try{copied=document.execCommand("copy")}catch{}
    }
    $("#builder-copy-status").textContent=copied
      ?"Copied. Paste it into your coding agent, then point the agent to your video file."
      :"Copy was blocked. The prompt is selected, press Ctrl+C.";
  });

  sync();
}
