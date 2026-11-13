// Smooth scroll, videos that load and play only when on screen, sound toggle, copy buttons.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // smooth scroll (skipped when the visitor asked for less motion)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -24, duration: 1.1 }); else el.scrollIntoView();
    history.replaceState(null, "", a.getAttribute("href"));
  }));

  // videos load only when they come near the screen, play while visible, pause when not
  const vids = [...document.querySelectorAll("video[data-src]")];
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; v.load(); }
        if (!reduce || v.closest(".hero-video")) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: "200px 0px", threshold: 0.25 });
  vids.forEach(v => io.observe(v));

  // tap a video to pause or play it
  vids.forEach(v => v.addEventListener("click", () => (v.paused ? v.play() : v.pause())));

  // sound toggle: only one video plays with sound at a time
  document.querySelectorAll(".sound").forEach(btn => {
    const v = btn.parentElement.querySelector("video");
    btn.addEventListener("click", () => {
      const on = v.muted;
      vids.forEach(o => { o.muted = true; });
      document.querySelectorAll(".sound").forEach(b => { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Turn sound on"); });
      v.muted = !on;
      if (on) { v.currentTime = 0; v.play().catch(() => {}); }
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    });
  });

  // copy buttons
  document.querySelectorAll(".copy").forEach(btn => btn.addEventListener("click", async () => {
    const src = document.getElementById(btn.dataset.copy);
    const text = src.textContent;
    try { await navigator.clipboard.writeText(text); }
    catch { const r = document.createRange(); r.selectNodeContents(src); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy"); }
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = "Copy"; }, 1600);
  }));
})();
