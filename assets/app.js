/* Page shell: sticky nav state and the reveal-on-scroll pass.
   The old four-mode scroll demo lived here and targeted elements that no longer
   exist (#demo-phone, [data-demo-mode], #preview-label). It was removed rather
   than left to spin silently. The component showcase now does that job. */

const nav = document.querySelector(".site-nav");
const reveals = [...document.querySelectorAll(".reveal")];

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
reveals.forEach((el) => revealObserver.observe(el));

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    nav?.classList.toggle("scrolled", window.scrollY > 24);
    ticking = false;
  });
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
