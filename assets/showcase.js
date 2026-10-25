/* One component, five styles. Same skeleton, different variables.
   No drawn people, no invented numbers: footage slots are labelled honestly
   and real clips can drop into the same slot later. */

const SHOWCASE = document.querySelector("#showcase");
if (SHOWCASE) {
  const THEMES = [
    { key: "product", name: "Product Clean", desc: "Bright, generous space, soft cards, tight sans." },
    { key: "creator", name: "Creator Utility", desc: "Dark, wide type, lime accent, fast proof." },
    { key: "data", name: "Data Editorial", desc: "Warm paper, serif numerals, rust accent." },
    { key: "tutorial", name: "Tutorial Steps", desc: "Cool light, blue accent, obvious steps." },
    { key: "minimal", name: "Bare Minimal", desc: "Black, wide caps, one hairline, no cards." }
  ];

  const COMPONENTS = [
    { key: "face", name: "Talking head", kind: "layout" },
    { key: "split", name: "Split screen", kind: "layout" },
    { key: "full", name: "Full-screen proof", kind: "layout" },
    { key: "card", name: "Floating card", kind: "layout" },
    { key: "bigcard", name: "Big card", kind: "layout" },
    { key: "stat", name: "Stat card", kind: "data" },
    { key: "step", name: "Step card", kind: "data" },
    { key: "ui", name: "Screenshot / UI", kind: "proof" },
    { key: "cards", name: "Multiple cards", kind: "layout" },
    { key: "green", name: "Green screen", kind: "layout" }
  ];

  const foot = (label = "your footage") =>
    `<div class="cs-foot"><span class="cs-slot">${label}</span></div>`;

  const doc = (lines = 3) =>
    `<div class="cs-doc"><div class="cs-bar"><b></b><b></b><b></b></div><div class="cs-body">${
      Array.from({ length: lines }, (_, i) => `<i style="width:${[86, 62, 74, 48][i % 4]}%"></i>`).join("")
    }</div></div>`;

  const cap = (text = 'THIS IS THE <mark>PART</mark> THAT MATTERS') =>
    `<div class="cs-cap">${text}</div>`;

  const card = (small = "proof", strong = "12x") =>
    `<div class="cs-card"><small>${small}</small><strong>${strong}</strong></div>`;

  const build = (comp) => {
    switch (comp) {
      case "face":
        return foot() + cap();
      case "split":
        return foot("speaker") + cap() + doc(3);
      case "full":
        return foot("real screen, demo, or result") + `<div class="cs-kicker">proof</div>` + cap("HERE IS THE <mark>REAL</mark> THING");
      case "card":
        return foot() + card() + cap();
      case "bigcard":
        return foot() + `<div class="cs-big"><small>the point</small><strong>SHOW THE RESULT</strong></div>`;
      case "stat":
        return `<div class="cs-stat"><div class="cs-kicker">measured</div><div class="cs-num">4<b>7</b>%</div><div class="cs-bars">${
          [28, 46, 62, 88, 70, 54].map((h) => `<i style="height:${h}%"></i>`).join("")
        }</div><div class="cs-legend">real numbers only</div></div>`;
      case "step":
        return `<div class="cs-badge">STEP 02</div>` + doc(2) + `<div class="cs-arrow"></div>` + cap("Click this");
      case "ui":
        return `<div class="cs-doc"><div class="cs-bar"><b></b><b></b><b></b></div><span class="cs-doc-title">the real screen</span><div class="cs-body">${
          Array.from({ length: 3 }, (_, i) => `<i style="width:${[86, 62, 74][i]}%"></i>`).join("")
        }</div></div>`;
      case "cards":
        return card("before", "old way") + card("after", "this way") + card("cost", "free");
      case "green":
        return foot("speaker") + doc(2) + cap("ON <mark>REAL</mark> MEDIA");
      default:
        return foot();
    }
  };

  const render = (comp) => {
    SHOWCASE.querySelectorAll(".sc-chip").forEach((chip) =>
      chip.classList.toggle("is-on", chip.dataset.comp === comp)
    );
    SHOWCASE.querySelector("#sc-grid").innerHTML = THEMES.map(
      (theme) => `
      <div class="sc-item">
        <div class="sc-phone t-${theme.key}" data-comp="${comp}">
          <div class="sc-stage">${build(comp)}</div>
        </div>
        <div class="sc-name"><strong>${theme.name}</strong><em>${comp === "stat" ? "data" : comp === "step" || comp === "ui" ? "proof" : "layout"}</em></div>
        <span class="sc-desc">${theme.desc}</span>
      </div>`
    ).join("");
  };

  SHOWCASE.querySelector("#sc-chips").innerHTML = COMPONENTS.map(
    (c) => `<button class="sc-chip" type="button" data-comp="${c.key}">${c.name}</button>`
  ).join("");

  SHOWCASE.querySelector("#sc-chips").addEventListener("click", (event) => {
    const chip = event.target.closest(".sc-chip");
    if (chip) render(chip.dataset.comp);
  });

  const initial = (() => {
    const fromQuery = new URLSearchParams(location.search).get("comp");
    const fromHash = location.hash.startsWith("#looks=") ? location.hash.slice(7) : "";
    const wanted = fromQuery || fromHash;
    return COMPONENTS.some((c) => c.key === wanted) ? wanted : "split";
  })();

  render(initial);
}
