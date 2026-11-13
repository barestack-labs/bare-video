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
    window.lenis = lenis;
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

  /* the edit inspector: pick a model, its video plays, its scenes are listed and clickable */
  const M = "https://media.paulablaza.com/";
  const EDITS = [
    { name: "Claude Haiku 5.5", via: "Claude Code", free: false, time: "3.2 min", tokens: "~91k tokens", video: "haiku-daylight.mp4", poster: "assets/frames/haiku-daylight.jpg", len: 52.2,
      scenes: [[0, "Title", "A cheap AI model edits your video"], [6.6, "Talking", "Speaker on screen"], [13.4, "Label", "Bare Video"], [16.6, "Punch-in", "Zooms in on the point"], [20.3, "Steps", "Create a folder, put the video in, open it"], [25.4, "Talking", "Speaker on screen"], [50.4, "End card", "Made with Bare Video"]] },
    { name: "Nemotron 3 Ultra", via: "OpenCode + Kilo", free: true, time: "5.9 min", tokens: "~102k tokens", video: "nemotron-ultra.mp4", poster: "assets/frames/nemotron-ultra.jpg", len: 58.8,
      scenes: [[0, "Title", "Edited by a cheaper model"], [5.1, "Talking", "Speaker on screen"], [11.9, "Label", "Bare Video"], [20, "Label", "Cheap models work"], [27.2, "List", "Copy repo, ask agent, handle the app"], [33, "Punch-in", "Zooms in on the point"], [37.9, "Label", "Prompt builder"], [43.4, "Steps", "Create folder, put video in, open, let it work"], [53.7, "End card", "Try Bare Video"]] },
    { name: "Nemotron 3.5 Super VL", via: "OpenCode + Kilo", free: true, time: "8.5 min", tokens: "~227k tokens", video: "nemotron-vl.mp4", poster: "assets/frames/nemotron-vl.jpg", len: 43.9,
      scenes: [[0, "Title", "Edited by a cheap model"], [5, "Talking", "Speaker on screen"], [12, "Label", "Bare Video"], [21, "Stat", "3 transcription options"], [25, "Talking", "Speaker on screen"], [32, "Label", "Captions"], [40, "End card", "Try Bare Video"]] },
  ];
  const models = $(".models"), list = $("#ins-scenes"), iv = $("#ins-video"), track = $(".timeline .track"), head = $(".timeline .head");
  let cur = 0;
  const fmt = t => `0:${String(Math.floor(t)).padStart(2, "0")}`;
  function pick(i) {
    cur = i;
    const e = EDITS[i];
    [...models.children].forEach((b, k) => b.setAttribute("aria-checked", String(k === i)));
    list.innerHTML = e.scenes.map(([t, kind, text], k) => `<li><button type="button" data-t="${t}"><span class="t">${fmt(t)}</span><span><b>${kind}</b>${text}</span></button></li>`).join("");
    track.innerHTML = e.scenes.map(([t, kind], k) => { const end = (e.scenes[k + 1] || [e.len])[0]; return `<button type="button" class="seg k-${kind.split(" ")[0].toLowerCase().replace("-", "")}" data-t="${t}" style="left:${t / e.len * 100}%;width:${(end - t) / e.len * 100}%" title="${kind} at ${fmt(t)}"></button>`; }).join("");
    const src = M + e.video;
    if (iv.dataset.src !== src) {
      iv.dataset.src = src; iv.poster = e.poster;
      if (iv.getAttribute("src")) { iv.style.opacity = "0"; iv.src = src; iv.load(); iv.play().catch(() => {}); setTimeout(() => { iv.style.opacity = "1"; }, 150); }
    }
  }
  if (models) {
    models.innerHTML = EDITS.map((e, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-i="${i}"><span class="mname">${e.name}${e.free ? '<i>free</i>' : ""}</span><span class="mvia">${e.via}</span><span class="mstats">${e.time} · ${e.tokens} · ${Math.round(e.len)}s video</span></button>`).join("");
    models.addEventListener("click", ev => { const b = ev.target.closest("[data-i]"); if (b) pick(+b.dataset.i); });
    const seek = ev => { const b = ev.target.closest("[data-t]"); if (!b) return; if (!iv.getAttribute("src")) { iv.src = iv.dataset.src; } iv.currentTime = +b.dataset.t + 0.05; iv.play().catch(() => {}); };
    list.addEventListener("click", seek);
    track.addEventListener("click", seek);
    iv.loop = true;
    iv.addEventListener("timeupdate", () => {
      const e = EDITS[cur], t = iv.currentTime;
      head.style.left = `${Math.min(100, t / e.len * 100)}%`;
      let on = 0; e.scenes.forEach(([st], k) => { if (t >= st - 0.05) on = k; });
      [...list.children].forEach((li, k) => li.classList.toggle("on", k === on));
      [...track.children].forEach((sg, k) => sg.classList.toggle("on", k === on));
    });
    pick(0);
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
