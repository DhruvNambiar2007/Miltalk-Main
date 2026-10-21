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
  function show(progress) {
    counters.forEach(({element, target, prefix, suffix, decimals}) => {
      const factor = 10 ** decimals;
      const value = progress === 1 ? target : Math.floor(target * progress * factor) / factor;
      element.textContent = prefix + value.toFixed(decimals).replace(/\.0+$/, '') + suffix;
    });
  }
  function finish() {
    cancelAnimationFrame(frame);
    finished = true;
    show(1);
  }
  if (motion.matches || !('IntersectionObserver' in window)) return;
  show(0);
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    if (finished || motion.matches) { finish(); return; }
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / 1800, 1);
      show(1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
  }, {threshold: .3});
  observer.observe(section);
  motion.addEventListener('change', event => { if (event.matches) finish(); });
})();
