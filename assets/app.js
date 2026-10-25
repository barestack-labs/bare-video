const setupPrompt = `Set up this Bare Video repo inside this project folder.

My video is: ./input/video.mp4

Reuse tools already installed on my computer. Keep new downloads project-local unless I explicitly ask for a global install. Ask before credentials, paid operations, or large downloads. Plan the edit with me unless I explicitly ask for one-shot mode. Open the HyperFrames preview before final export.`;

document.querySelectorAll('[data-copy-prompt]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(setupPrompt);
    const toast = document.querySelector('.toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  });
});

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
