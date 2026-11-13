// Theme toggle, smooth scroll, model tabs, scroll reveals, lazy videos, sound, copy buttons.
(function () {
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* theme: white by default, remembered once the visitor picks dark */
  const themeBtn = $(".theme");
  const setTheme = dark => {
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    if (themeBtn) themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("bv-theme", dark ? "dark" : "light"); } catch (e) {}
  };
  if (themeBtn) themeBtn.addEventListener("click", () => setTheme(root.dataset.theme !== "dark"));
  if (themeBtn && root.dataset.theme === "dark") themeBtn.setAttribute("aria-label", "Switch to light mode");

  /* smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -76, duration: 1.1 }); else el.scrollIntoView({ block: "start" });
    history.replaceState(null, "", a.getAttribute("href"));
  }));

  /* reveal sections as they come into view */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  $$(".reveal").forEach(el => rio.observe(el));

  /* videos load near the screen and play while visible */
  const vio = new IntersectionObserver(es => es.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting) { if (!v.getAttribute("src")) { v.src = v.dataset.src; v.load(); } v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }), { rootMargin: "200px 0px", threshold: 0.2 });
  $$("video[data-src]").forEach(v => { vio.observe(v); v.addEventListener("click", () => (v.paused ? v.play() : v.pause())); });

  $$(".sound").forEach(btn => {
    const v = btn.parentElement.querySelector("video");
    btn.addEventListener("click", () => {
      const turnOn = v.muted;
      $$("video").forEach(o => { o.muted = true; });
      $$(".sound").forEach(b => { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Turn sound on"); });
      v.muted = !turnOn;
      if (turnOn) { v.currentTime = 0; v.play().catch(() => {}); }
      btn.setAttribute("aria-pressed", String(turnOn));
      btn.setAttribute("aria-label", turnOn ? "Turn sound off" : "Turn sound on");
    });
  });

  /* the demo window: each tab replays what that model actually did, next to the video it made */
  const M = "https://media.paulablaza.com/";
  const DEMOS = [
    { path: "videos/demo · claude code · haiku", video: "haiku-daylight.mp4", poster: "assets/frames/haiku-daylight.jpg",
      steps: ["Read <code>bare-video/SKILL.md</code>", "Transcribed with Groq, 628 words", "Kept the best takes, cut 4:22 down to 52 s", "Planned 10 scenes in the daylight look", "Check passed, built the preview", "Looked at its own snapshots, nothing cut off"],
      stats: [["Agent time", "3.2 min"], ["Tokens", "~91k"], ["Tool calls", "19"], ["Cost", "paid plan"]] },
    { path: "videos/demo · kilo free · nemotron 3 ultra", video: "nemotron-ultra.mp4", poster: "assets/frames/nemotron-ultra.jpg",
      steps: ["Read <code>bare-video/SKILL.md</code>", "Transcribed with Groq, 605 words", "Tried three cuts until it fit, ended at 59 s", "Planned 11 scenes, fixed every checker warning", "Check passed, built the preview", "One miss: spelled the website wrong, fixed by hand"],
      stats: [["Agent time", "5.9 min"], ["Tokens", "~102k"], ["Tool calls", "30"], ["Cost", "free"]] },
    { path: "videos/demo · kilo free · nemotron 3.5 super vl", video: "nemotron-vl.mp4", poster: "assets/frames/nemotron-vl.jpg",
      steps: ["Read <code>bare-video/SKILL.md</code>", "Transcribed with Groq, 607 words", "Switched to word ranges to avoid half sentences, 44 s", "Fixed a misheard name in the captions", "Check passed, built the preview", "Looked at its own snapshots before finishing"],
      stats: [["Agent time", "8.5 min"], ["Tokens", "~227k"], ["Tool calls", "35"], ["Cost", "free"]] },
  ];
  const log = $("#demo-log"), stats = $("#demo-stats"), dv = $("#demo-video"), path = $("#demo-path");
  let timers = [];
  function showDemo(i) {
    const d = DEMOS[i];
    timers.forEach(clearTimeout); timers = [];
    path.textContent = d.path;
    log.innerHTML = d.steps.map(s => `<li><span>${s}</span></li>`).join("");
    stats.innerHTML = d.stats.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    stats.classList.remove("in");
    const lis = [...log.children];
    lis.forEach((li, k) => timers.push(setTimeout(() => li.classList.add("in"), reduce ? 0 : 120 + k * 260)));
    timers.push(setTimeout(() => stats.classList.add("in"), reduce ? 0 : 160 + lis.length * 260));
    const src = M + d.video;
    if (dv.dataset.src !== src) {
      dv.style.opacity = "0";
      dv.dataset.src = src; dv.poster = d.poster;
      if (dv.getAttribute("src")) { dv.src = src; dv.load(); dv.play().catch(() => {}); }
      timers.push(setTimeout(() => { dv.style.opacity = "1"; }, 120));
    }
  }
  if (log) {
    const tabs = $$('[role="tab"]');
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(o => o.setAttribute("aria-selected", String(o === t)));
      showDemo(+t.dataset.tab);
    }));
    showDemo(0);
  }

  /* tutorial: folder animation plays when it scrolls into view */
  $$(".folder-anim").forEach(box => {
    const rows = [...box.querySelectorAll(".row")];
    const fio = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      fio.disconnect();
      rows.forEach((r, k) => setTimeout(() => r.classList.add("in"), reduce ? 0 : k * 380));
    }, { threshold: 0.4 });
    fio.observe(box);
  });

  /* tutorial: highlight the section you are reading */
  const tocLinks = $$(".toc a");
  if (tocLinks.length) {
    const map = new Map(tocLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      tocLinks.forEach(a => a.classList.toggle("on", a === map.get(e.target.id)));
    }), { rootMargin: "-20% 0px -70% 0px" });
    map.forEach((_, id) => { const h = document.getElementById(id); if (h) tio.observe(h); });
  }

  /* copy buttons */
  $$(".copy").forEach(btn => btn.addEventListener("click", async () => {
    const src = document.getElementById(btn.dataset.copy);
    try { await navigator.clipboard.writeText(src.textContent); }
    catch { const r = document.createRange(); r.selectNodeContents(src); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy"); }
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = "Copy"; }, 1600);
  }));
})();
