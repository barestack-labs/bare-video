/* One component, five styles. Same skeleton, different tokens.
   No drawn people, no invented metrics: footage areas are labelled slots and
   every card carries real words so the type is visible. */

const SHOWCASE = document.querySelector("#showcase");
if (SHOWCASE) {
  const THEMES = [
    { key: "product", name: "Product Clean", desc: "White, tight sans, soft cards." },
    { key: "creator", name: "Creator Utility", desc: "Near-black, wide caps, lime accent." },
    { key: "data", name: "Data Editorial", desc: "Warm paper, serif, rust accent, hairlines." },
    { key: "tutorial", name: "Tutorial Steps", desc: "Cool grey, blue accent, numbered steps." },
    { key: "minimal", name: "Bare Minimal", desc: "Black, wide caps, hairline only." }
  ];

  const COMPONENTS = [
    { key: "face", name: "Talking head" },
    { key: "split", name: "Split screen" },
    { key: "full", name: "Full-screen proof" },
    { key: "card", name: "Floating card" },
    { key: "bigcard", name: "Big card" },
    { key: "stat", name: "Stat card" },
    { key: "step", name: "Step card" },
    { key: "ui", name: "Screenshot / UI" },
    { key: "cards", name: "Multiple cards" },
    { key: "green", name: "Green screen" }
  ];

  const foot = (label = "your footage") =>
    `<div class="cs-foot"><span class="cs-slot">${label}</span></div>`;

  const cap = (html = "THE PART THAT <mark>MATTERS</mark>") =>
    `<div class="cs-cap">${html}</div>`;

  const card = (small, strong) =>
    `<div class="cs-card"><small>${small}</small><strong>${strong}</strong></div>`;

  const lines = (widths = [84, 58, 72]) =>
    `<div class="cs-lines">${widths.map((w) => `<i style="width:${w}%"></i>`).join("")}</div>`;

  const doc = (title, widths = [84, 58, 72]) =>
    `<div class="cs-doc"><div class="cs-bar"><b></b><b></b><b></b></div><div class="cs-docbody"><span class="cs-doc-title">${title}</span>${lines(widths)}</div></div>`;

  const build = (comp) => {
    switch (comp) {
      case "face":
        return foot() + cap();

      case "split":
        return foot("speaker") + cap("SHOW THE <mark>REAL</mark> THING") + doc("open the file");

      case "full":
        return foot("real screen, demo, or result") + `<span class="cs-kicker">proof</span>` + cap("HERE IT <mark>IS</mark>");

      case "card":
        return foot() + card("measured", "3.4x") + cap("SAME <mark>EDIT</mark>");

      case "bigcard":
        return foot() + `<div class="cs-big"><small>the point</small><strong>SHOW THE<br>RESULT</strong>${lines([70, 44])}</div>`;

      case "stat":
        return `<div class="cs-stat"><span class="cs-kicker">measured</span><div class="cs-num">4<b>7</b>%</div><div class="cs-bars">${
          [26, 44, 60, 88, 66, 52].map((h) => `<i style="height:${h}%"></i>`).join("")
        }</div><span class="cs-legend">real numbers only</span></div>`;

      case "step":
        return `<span class="cs-badge">STEP 02</span>` + doc("click this button", [64, 40]) +
          `<div class="cs-arrow"></div>` + cap("THEN <mark>THIS</mark>");

      case "ui":
        return doc("the real screen", [88, 62, 74]) +
          `<div class="cs-toolbar"><i></i><i></i><i></i></div>`;

      case "cards":
        return card("before", "old way") + card("after", "this way") + card("cost", "free");

      case "green":
        return `<div class="cs-keybg"></div>` + foot("speaker") + doc("the page you mean", [78, 54]) + cap("ON <mark>MEDIA</mark>");

      default:
        return foot();
    }
  };

  const phone = (theme, comp, ori = "top") => `
    <div class="sc-item">
      <div class="sc-phone t-${theme.key}" data-comp="${comp}" data-ori="${ori}">
        <div class="sc-stage">${build(comp)}</div>
      </div>
      <div class="sc-name"><strong>${theme.name}</strong></div>
      <span class="sc-desc">${theme.desc}</span>
    </div>`;

  /* the builder reuses the same renderer so its previews match the page */
  window.bvPhone = (comp, themeKey, cls = "mini", ori = "top") =>
    `<div class="sc-phone t-${themeKey} ${cls}" data-comp="${comp}" data-ori="${ori}"><div class="sc-stage">${build(comp)}</div></div>`;

  let currentComp = "split";
  let currentOri = "top";

  const render = (comp, ori = "top") => {
    currentComp = comp;
    currentOri = ori;
    SHOWCASE.querySelectorAll(".sc-chip").forEach((chip) =>
      chip.classList.toggle("is-on", chip.dataset.comp === comp)
    );
    const oriBox = SHOWCASE.querySelector("#sc-ori");
    if (oriBox) {
      oriBox.hidden = comp !== "split";
      oriBox.querySelectorAll("[data-ori]").forEach((b) =>
        b.classList.toggle("is-on", b.dataset.ori === ori)
      );
    }
    SHOWCASE.querySelector("#sc-grid").innerHTML = THEMES.map((t) => phone(t, comp, ori)).join("");
  };

  /* every component on one page, for checking: ?all=1 */
  if (new URLSearchParams(location.search).get("all") === "1") {
    document.querySelector("#looks").innerHTML =
      COMPONENTS.map(
        (c) => `<div class="wrap allrow"><p class="eyebrow">${c.name}</p><div class="sc-grid">${
          THEMES.map((t) => phone(t, c.key)).join("")
        }</div></div>`
      ).join("");
  } else {
    SHOWCASE.querySelector("#sc-chips").innerHTML = COMPONENTS.map(
      (c) => `<button class="sc-chip" type="button" data-comp="${c.key}">${c.name}</button>`
    ).join("");

    SHOWCASE.querySelector("#sc-chips").addEventListener("click", (event) => {
      const chip = event.target.closest(".sc-chip");
      if (chip) render(chip.dataset.comp, "top");
    });

    const oriBox = SHOWCASE.querySelector("#sc-ori");
    if (oriBox) {
      oriBox.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-ori]");
        if (btn) render(currentComp, btn.dataset.ori);
      });
    }

    const wanted =
      new URLSearchParams(location.search).get("comp") ||
      (location.hash.startsWith("#looks=") ? location.hash.slice(7) : "");
    const wantedOri = new URLSearchParams(location.search).get("ori") === "bottom" ? "bottom" : "top";

    render(COMPONENTS.some((c) => c.key === wanted) ? wanted : "split", wantedOri);
  }
}
