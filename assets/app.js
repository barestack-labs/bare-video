
const setupPrompt = `Set up this Bare Video repo inside this project folder.\n\nMy video is: ./input/video.mp4\n\nUse the recommended defaults. Reuse tools already installed on my computer. Keep any new downloads project-local unless I explicitly ask for a global install. Ask before credentials, paid operations, or large downloads. Plan the edit with me unless I explicitly ask for one-shot mode. Open the HyperFrames preview before final export.`;

document.querySelectorAll('[data-copy-prompt]').forEach(btn => {
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(setupPrompt);
    const t = document.querySelector('.toast');
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1600);
  });
});
