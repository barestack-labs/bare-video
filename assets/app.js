const nav=document.querySelector(".site-nav");
const reveals=[...document.querySelectorAll(".reveal")];
const demoPhone=document.querySelector("#demo-phone");
const previewLabel=document.querySelector("#preview-label");
const tabs=[...document.querySelectorAll("[data-demo-mode]")];
const looks=document.querySelector("#looks");

const modes=["face","split","overlay","proof"];
const labels={
  face:"Face-first · keep the person full-screen while the speaker is the strongest visual.",
  split:"Split-screen · keep the speaker visible while a screen, demo, or screenshot shares the frame.",
  overlay:"Light overlays · add small proof, labels, screenshots, logos, or stats over the footage.",
  proof:"Full-screen proof · let the real screen, result, repo, or demo take over when viewers need to see it."
};

function setMode(mode){
  if(!demoPhone)return;
  demoPhone.dataset.phoneMode=mode;
  tabs.forEach(tab=>tab.classList.toggle("is-active",tab.dataset.demoMode===mode));
  if(previewLabel)previewLabel.textContent=labels[mode]||"";
}

function looksMetrics(){
  if(!looks)return null;
  const top=looks.offsetTop;
  const travel=Math.max(1,looks.offsetHeight-window.innerHeight);
  return{top,travel};
}

function syncModeToScroll(){
  if(!looks||!demoPhone)return;
  const metrics=looksMetrics();
  const progress=Math.max(0,Math.min(.9999,(window.scrollY-metrics.top)/metrics.travel));
  const index=Math.min(modes.length-1,Math.floor(progress*modes.length));
  setMode(modes[index]);
}

tabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>{
    const metrics=looksMetrics();
    if(!metrics){
      setMode(tab.dataset.demoMode);
      return;
    }
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target=metrics.top+metrics.travel*((index+.08)/modes.length);
    window.scrollTo({top:target,behavior:reduced?"auto":"smooth"});
  });
});

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12});
reveals.forEach(el=>revealObserver.observe(el));

let ticking=false;
function onScroll(){
  nav?.classList.toggle("scrolled",window.scrollY>24);
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(()=>{
    syncModeToScroll();
    ticking=false;
  });
}

setMode("face");
onScroll();
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",syncModeToScroll);
