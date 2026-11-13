/* Bare Video runtime. Reads window.BV (written by scripts/build.mjs) and builds one paused GSAP timeline.
   Every tween has an absolute time and explicit start values, so the renderer can seek to any frame. */
function bvStart() {
  const V = window.BV;
  const root = document.getElementById("root");
  const $ = id => document.getElementById(id);
  const D = V.duration;
  const tl = gsap.timeline({ paused: true });

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = s => esc(s).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');
  // each word in its own mask so it can rise from behind a line
  const masked = s => {
    let hot = false;
    return String(s ?? "").split(/\s+/).filter(Boolean).map(w => {
      const open = w.startsWith("*"), close = /\*[.,!?;:]*$/.test(w);
      if (open) hot = true;
      const html = `<span class="m"><span class="w${hot ? " hl" : ""}">${esc(w.replace(/\*/g, ""))}</span></span>`;
      if (close) hot = false;
      return html;
    }).join(" ");
  };
  const el = (parent, cls, html) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html || ""; parent.appendChild(d); return d; };

  // entrance: becomes visible at t (no fade), and the motion is what the viewer sees
  const appear = (node, t, from, dur) => {
    tl.set(node, { autoAlpha: 0 }, 0);
    tl.set(node, { autoAlpha: 1 }, t);
    if (from) tl.fromTo(node, from, { x: 0, y: 0, scale: 1, rotation: 0, duration: dur || 0.6, ease: "expo.out", immediateRender: false }, t);
  };
  const leave = (node, t) => {
    tl.fromTo(node, { y: 0, autoAlpha: 1 }, { y: -28, autoAlpha: 0, duration: 0.18, ease: "power2.in", immediateRender: false }, t - 0.18);
    tl.set(node, { autoAlpha: 0 }, t);
  };
  const rise = (h, t) => {
    const ws = h.querySelectorAll(".w");
    tl.fromTo(ws, { yPercent: 115 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.055, immediateRender: true }, t);
  };

  /* ---------- camera ---------- */
  const W = V.footage.width, H = V.footage.height, [fx, fy] = V.focus;
  const PANEL = { face: [0, 0, 1080, 1920], split: [0, 1000, 1080, 920], full: [0, 1920, 1080, 0] };
  const CAPY = { face: 1330, split: 1000, full: 1390 };
  const camv = $("camv"), cam = $("cam"), seam = $("seam"), caps = $("caps");
  function frame(layout, z) {
    const [px, py, pw, ph] = PANEL[layout === "full" ? "face" : layout];
    const s = Math.max(pw / W, ph / H) * z;
    let x = px + pw / 2 - fx * W * s, y = py + ph * 0.42 - fy * H * s;
    x = Math.min(px, Math.max(px + pw - W * s, x));
    y = Math.min(py, Math.max(py + ph - H * s, y));
    return { x, y, scale: s };
  }
  const clipFor = layout => `inset(${PANEL[layout][1]}px 0px 0px 0px)`;

  /* ---------- scenes ---------- */
  const S = V.scenes;
  let prevLayout = null, parity = false;
  const camKeys = [];
  S.forEach((s, k) => {
    const L = s.layout;
    const first = k === 0;
    if (L !== prevLayout) {
      const d = first ? 0 : 0.5, e = "power3.inOut";
      if (first) {
        tl.set(cam, { clipPath: clipFor(L) }, 0);
        tl.set(seam, { y: 998, autoAlpha: L === "split" ? 1 : 0 }, 0);
        tl.set(caps, { y: CAPY[L] }, 0);
      } else {
        tl.fromTo(cam, { clipPath: clipFor(prevLayout) }, { clipPath: clipFor(L), duration: d, ease: e, immediateRender: false }, s.t);
        tl.fromTo(seam, { autoAlpha: prevLayout === "split" ? 1 : 0 }, { autoAlpha: L === "split" ? 1 : 0, duration: 0.25, immediateRender: false }, s.t);
        tl.fromTo(caps, { y: CAPY[prevLayout] }, { y: CAPY[L], duration: d, ease: e, immediateRender: false }, s.t);
      }
    }
    camKeys.push({ t: s.t, layout: L, z: s.punch ? 1.12 : 1, tween: !first, dur: s.punch ? 0.45 : 0.5 });
    prevLayout = L;
    if (s.type && s.type !== "none") buildScene(s, k, L !== (S[k - 1] || {}).layout && !first ? 0.22 : 0);
  });

  // jump-cut cover: at every join inside a face or split shot the framing steps 1.0 <-> 1.06
  const sceneAt = t => S.filter(s => s.t <= t + 1e-6).pop() || S[0];
  V.joins.forEach(j => {
    const s = sceneAt(j);
    if (s.layout === "full" || j - s.t < 0.6 || j > D - 0.3) return;
    camKeys.push({ t: j, layout: s.layout, z: s.punch ? 1.12 : 1, join: true });
  });
  camKeys.sort((a, b) => a.t - b.t);
  let last = null;
  camKeys.forEach(c => {
    if (c.join) parity = !parity;
    else if (c.tween) parity = false;
    const f = frame(c.layout, c.z * (parity ? 1.06 : 1));
    if (!last) tl.set(camv, f, 0);
    else if (c.join) tl.set(camv, f, c.t);
    else tl.fromTo(camv, last, Object.assign({}, f, { duration: c.dur, ease: "power3.inOut", immediateRender: false }), c.t);
    last = f;
  });

  function buildScene(s, k, lag) {
    const box = el($("scenes"), `sc on-${s.layout} ${s.type}`);
    const t0 = s.t + lag + 0.05;
    const end = s.end;
    const items = s.items || [];
    if (s.kicker) el(box, "kick", esc(s.kicker));
    switch (s.type) {
      case "title": {
        el(box, "h h1", masked(s.text));
        if (s.sub) el(box, "sub", rich(s.sub));
        break;
      }
      case "label": {
        box.classList.remove("on-split", "on-full"); box.classList.add("on-face");
        box.innerHTML = `<div class="bar"></div><div><div class="h">${rich(s.text)}</div>${s.sub ? `<div class="sub">${rich(s.sub)}</div>` : ""}</div>`;
        break;
      }
      case "list": {
        const rows = el(box, "rows");
        items.forEach((it, i) => {
          const mark = s.style === "numbers" ? `<span class="num">${String(i + 1).padStart(2, "0")}</span>` : s.style === "checks" ? '<span class="chk"></span>' : '<span class="dot"></span>';
          it.node = el(rows, "row h", `${mark}<span>${rich(it.text)}</span>`);
        });
        break;
      }
      case "steps": {
        const wrap = el(box, "steps");
        items.forEach((it, i) => {
          if (i) it.link = el(wrap, "step-link");
          it.node = el(wrap, "step h", `<span class="n">${i + 1}</span><span>${rich(it.text)}</span>`);
        });
        break;
      }
      case "stat": {
        box.classList.add("stat");
        s.numNode = el(box, "num-big", esc(s.value));
        if (s.text) el(box, "sub", rich(s.text));
        if (s.source) el(box, "src", esc(s.source));
        break;
      }
      case "compare": {
        const g = el(box, "cmp");
        items.slice(0, 2).forEach((it, i) => {
          if (i) el(g, "vs", "vs");
          it.node = el(g, "col" + (s.win === i + 1 ? " win" : ""), `${it.label ? `<span class="kick">${esc(it.label)}</span>` : ""}<b class="h">${rich(it.text)}</b>`);
        });
        break;
      }
      case "quote": {
        el(box, "qm", "“");
        el(box, "h", rich(s.text));
        if (s.sub) el(box, "sub", "— " + rich(s.sub));
        break;
      }
      case "chapter": {
        el(box, "cn", esc(s.number ?? String(S.filter(x => x.type === "chapter").indexOf(s) + 1).padStart(2, "0")));
        el(box, "h h1", masked(s.text));
        break;
      }
      case "end": {
        el(box, "h h1", masked(s.text));
        if (s.sub) el(box, "pill", esc(s.sub));
        break;
      }
      case "media": {
        placeMedia(s, box);
        break;
      }
    }

    // shrink to fit the box, never below 55 percent
    const limit = s.layout === "split" ? 760 : s.layout === "full" ? 1080 : 720;
    for (let kk = 1; kk >= 0.55; kk -= 0.05) {
      box.style.setProperty("--k", kk.toFixed(2));
      if (box.scrollHeight <= limit + 1 && box.scrollWidth <= box.clientWidth + 1) break;
    }

    // timeline
    if (s.type === "media") return;
    tl.set(box, { autoAlpha: 1 }, s.t + lag);
    if (s.layout === "face" || s.type === "label") tl.fromTo(box, { y: 60, scale: 0.96 }, { y: 0, scale: 1, duration: 0.6, ease: "expo.out", immediateRender: false }, s.t + lag);
    if (k + 1 < S.length) leave(box, end); else tl.set(box, { autoAlpha: 1 }, D);

    const kick = box.querySelector(".kick:first-child");
    if (kick) appear(kick, t0, { x: -40 }, 0.5);
    box.querySelectorAll(".h1").forEach(h => rise(h, t0 + (kick ? 0.12 : 0)));
    box.querySelectorAll(":scope > .sub, :scope > .pill, :scope > .src").forEach((n, i) => appear(n, t0 + 0.35 + i * 0.12, { y: 30 }, 0.5));
    if (s.type === "quote") { appear(box.querySelector(".qm"), t0, { y: 40 }); appear(box.querySelector(".h"), t0 + 0.12, { y: 40 }); }
    if (s.type === "chapter") appear(box.querySelector(".cn"), t0, { x: -60 });
    if (s.type === "label") appear(box.querySelector(".bar"), t0, { scaleY: 0 }, 0.5);
    if (s.type === "stat") {
      appear(s.numNode, t0, { scale: 0.7 }, 0.7);
      counter(s.numNode, String(s.value), t0, 1.0);
    }
    items.forEach((it, i) => {
      if (!it.node) return;
      if (it.link) { appear(it.link, it.t - 0.2, { scaleY: 0 }, 0.3); }
      appear(it.node, it.t, s.type === "compare" ? { y: 70 } : { x: -70 }, 0.55);
    });
  }

  // count the one number in a value like "$45,000", "312 km/h" or "4.2x". Values with several numbers just appear.
  function counter(node, value, t, dur) {
    const nums = value.match(/\d[\d,]*(\.\d+)?/g);
    if (!nums || nums.length !== 1) return;
    const raw = nums[0], to = parseFloat(raw.replace(/,/g, "")), dec = (raw.split(".")[1] || "").length, commas = raw.includes(",");
    const [pre, post] = value.split(raw);
    const show = x => { let n = x.toFixed(dec); if (commas) n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ","); node.textContent = pre + n + post; };
    let val = 0;
    const proxy = { get v() { return val; }, set v(x) { val = x; show(x); } };
    show(0);
    tl.fromTo(proxy, { v: 0 }, { v: to, duration: dur, ease: "power2.out", immediateRender: false }, t);
  }

  function placeMedia(s, box) {
    const m = $(s.mediaId);
    if (!m) return;
    const R = s.layout === "full" ? [0, 0, 1080, 1920] : s.layout === "split" ? [0, 0, 1080, 1000] : [64, 170, 952, 720];
    Object.assign(m.style, { left: R[0] + "px", top: R[1] + "px", width: R[2] + "px", height: R[3] + "px", objectFit: s.fit || "cover", background: "var(--bg)" });
    if (s.layout === "face") {
      m.style.clipPath = "inset(0 round var(--radius))";
      const f = el($("media"), "mframe");
      Object.assign(f.style, { left: R[0] + "px", top: R[1] + "px", width: R[2] + "px", height: R[3] + "px" });
      tl.set(f, { autoAlpha: 0 }, 0).set(f, { autoAlpha: 1 }, s.t).set(f, { autoAlpha: 0 }, s.end);
      tl.fromTo([m, f], { y: 80 }, { y: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, s.t);
    }
    tl.set(m, { autoAlpha: 0 }, 0).set(m, { autoAlpha: 1 }, s.t);
    if (s.end < D - 0.01) tl.set(m, { autoAlpha: 0 }, s.end);
    // slow push so a still image never looks frozen
    tl.fromTo(m, { scale: 1 }, { scale: s.zoom === false ? 1 : 1.07, duration: Math.max(0.1, s.end - s.t), ease: "none", immediateRender: false }, s.t);
    box.remove();
    if (s.text) {
      const chip = el(root, "chip", esc(s.text));
      if (s.layout === "face") chip.style.top = "910px";
      appear(chip, s.t + 0.3, { y: -20 }, 0.5);
      tl.set(chip, { autoAlpha: 0 }, s.end);
    }
  }

  /* ---------- captions ---------- */
  if (V.captions !== "off" && V.words.length) {
    const WD = V.words, chunks = [];
    const maxW = V.captions === "clean" ? 4 : 3, maxC = V.captions === "clean" ? 22 : 16;
    WD.forEach((w, i) => {
      const c = chunks[chunks.length - 1], p = WD[i - 1];
      const len = c ? c.map(x => x.w).join(" ").length + 1 + w.w.length : 0;
      if (!c || c.length >= maxW || len > maxC || /[.,?!;:]$/.test(p.w) || w.s - p.e > 0.35) chunks.push([w]); else c.push(w);
    });
    chunks.forEach((c, k) => {
      const next = chunks[k + 1];
      const end = next ? Math.min(next[0].s, c[c.length - 1].e + 0.6) : D;
      const node = el(caps, "cap", c.map(w => `<i>${esc(w.w.replace(/[.,;:]$/, ""))}</i>`).join(""));
      for (let fs = V.captions === "clean" ? 70 : 92; fs > 52 && (node.scrollHeight > 190 || node.scrollWidth > node.clientWidth + 1); fs -= 4) node.style.fontSize = fs - 4 + "px";
      tl.set(node, { autoAlpha: 0 }, 0).set(node, { autoAlpha: 1 }, c[0].s).set(node, { autoAlpha: 0 }, end);
      tl.fromTo(node, { y: 18 }, { y: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, c[0].s);
      [...node.children].forEach((sp, j) => {
        tl.set(sp, { "--on": 0 }, 0).set(sp, { "--on": 1 }, c[j].s);
        if (V.captions === "clean") return; // clean captions keep spoken words lit
        tl.set(sp, { "--on": 0 }, c[j + 1] ? c[j + 1].s : end);
      });
    });
  }

  tl.set({}, {}, D);
  window.__timelines = window.__timelines || {};
  window.__timelines["bare-video"] = tl;
  if (!window.__hyperframes) {
    const q = new URLSearchParams(location.search), at = parseFloat(q.get("t"));
    if (!isNaN(at)) tl.seek(at); else tl.play(0);
  }
}

// measure text with the real fonts, never the fallback
const BV_FONTS = ['800 100px "BV Inter"', '400 100px "BV Serif"', '700 30px "BV Mono"', '800 100px "BV Wide"'];
Promise.all(BV_FONTS.map(f => document.fonts.load(f))).then(bvStart, bvStart);
