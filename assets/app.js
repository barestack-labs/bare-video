const nav=document.querySelector(".site-nav");
const reveals=[...document.querySelectorAll(".reveal")];
const demoPhone=document.querySelector("#demo-phone");
const previewLabel=document.querySelector("#preview-label");
const tabs=[...document.querySelectorAll("[data-demo-mode]")];

const labels={
  face:"Face-first · keep the person full-screen unless another visual is more useful.",
  split:"Split-screen · keep the speaker visible while a screen, demo, or screenshot takes the top half.",
  overlay:"Light overlays · add small proof, labels, screenshots, logos, or stats without leaving the footage.",
  proof:"Full-screen proof · temporarily let the real screen, result, repo, or demo take over the frame."
};

function setMode(mode){
  if(!demoPhone)return;
  demoPhone.dataset.phoneMode=mode;
  tabs.forEach(tab=>tab.classList.toggle("is-active",tab.dataset.demoMode===mode));
  if(previewLabel)previewLabel.textContent=labels[mode]||"";
}
tabs.forEach(tab=>tab.addEventListener("click",()=>setMode(tab.dataset.demoMode)));

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12});
reveals.forEach(el=>revealObserver.observe(el));

function onScroll(){
  nav?.classList.toggle("scrolled",window.scrollY>24);
}
onScroll();
window.addEventListener("scroll",onScroll,{passive:true});

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&demoPhone){
  const modes=["face","split","overlay","proof"];
  let index=0;
  let timer=null;
  const looks=document.querySelector("#looks");
  const autoObserver=new IntersectionObserver(entries=>{
    const visible=entries.some(entry=>entry.isIntersecting);
    if(visible&&!timer){
      timer=setInterval(()=>{
        index=(index+1)%modes.length;
        setMode(modes[index]);
      },4200);
    }else if(!visible&&timer){
      clearInterval(timer);
      timer=null;
    }
  },{threshold:.4});
  if(looks)autoObserver.observe(looks);
  tabs.forEach(tab=>tab.addEventListener("pointerdown",()=>{
    index=Math.max(0,modes.indexOf(tab.dataset.demoMode));
  }));
}