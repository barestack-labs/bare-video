const nav = document.querySelector('.site-nav');
const hero = document.querySelector('.hero');
const demo = document.querySelector('.hero-demo');

const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 18);
  if (hero && demo) {
    const max = Math.max(hero.offsetHeight - window.innerHeight * .45, 1);
    const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
    demo.style.setProperty('--hero-progress', progress.toFixed(3));
  }
};

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const storyFrame = document.querySelector('.story-frame');
const storySteps = [...document.querySelectorAll('.story-step')];

if (storyFrame && storySteps.length) {
  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const scene = entry.target.dataset.storyScene;
      storyFrame.dataset.activeScene = scene;
      storySteps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
    });
  }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });

  storySteps.forEach((step) => storyObserver.observe(step));
  storySteps[0].classList.add('is-active');
}
