(() => {
  const section = document.querySelector('.impact-strip');
  if (!section) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...section.querySelectorAll('[data-count]')].map(element => ({
    element,
    target: Number(element.dataset.count),
    prefix: element.dataset.prefix || '',
    suffix: element.dataset.suffix || '',
    decimals: Number(element.dataset.decimals || 0)
  }));
  let frame = 0;
  let finished = false;
  function show(progresses) {
    counters.forEach(({element, target, prefix, suffix, decimals}, index) => {
      const progress = progresses[index];
      const factor = 10 ** decimals;
      const value = progress === 1 ? target : Math.floor(target * progress * factor) / factor;
      element.textContent = prefix + value.toFixed(decimals).replace(/\.0+$/, '') + suffix;
    });
  }
  function finish() {
    cancelAnimationFrame(frame);
    finished = true;
    show(counters.map(() => 1));
  }
  if (motion.matches || !('IntersectionObserver' in window)) return;
  show(counters.map(() => 0));
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    if (finished || motion.matches) { finish(); return; }
    const start = performance.now();
    function tick(now) {
      const duration = 3200;
      const gap = 300;
      const elapsed = now - start;
      const progresses = counters.map((_, index) => {
        const progress = Math.max(0, Math.min((elapsed - index * (duration + gap)) / duration, 1));
        return progress < .5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
      });
      show(progresses);
      if (elapsed < counters.length * duration + (counters.length - 1) * gap) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
  }, {threshold: .3});
  observer.observe(section);
  motion.addEventListener('change', event => { if (event.matches) finish(); });
})();
