document.querySelectorAll('[data-experiment]').forEach(demo => {
  const stages = {
    train: { number: '01 · Train', title: 'Show it examples of both categories.', copy: 'Students label examples as recyclable or non-recyclable. The kit uses those examples to learn the difference.', result: 'Collecting examples…' },
    test: { number: '02 · Test', title: 'A new bottle. A wrong prediction.', copy: 'In this example, the kit has only seen paper and cans as recyclable. It predicts that the unfamiliar bottle is non-recyclable. Students compare the prediction with the correct label.', result: 'Non-recyclable? Wrong this time.' },
    improve: { number: '03 · Improve', title: 'Add a bottle example. Test again.', copy: 'Students add a labelled bottle to the recyclable examples, then test another bottle. Here, the updated training leads to the correct prediction.', result: 'Recyclable. Correct this time.' }
  };
  const order = Object.keys(stages);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = demo.querySelector('.motion-toggle');
  let paused = reducedMotion.matches;
  let timer;
  let exampleTimer;
  let exampleIndex = 0;
  let visible = false;
  function showExample() {
    const examples = ['paper', 'can', 'tissue'];
    const labels = ['Training: paper', 'Training: can', 'Training: used tissue'];
    demo.querySelector('.scan-object').dataset.example = examples[exampleIndex];
    demo.querySelector('[data-object-label]').textContent = labels[exampleIndex];
  }
  function render(stage) {
    const content = stages[stage];
    demo.dataset.stage = stage;
    exampleIndex = 0;
    if (stage === 'train') showExample();
    else demo.querySelector('[data-object-label]').textContent = stage === 'test' ? 'New test bottle' : 'Another test bottle';
    demo.querySelector('[data-demo-number]').textContent = content.number;
    demo.querySelector('[data-demo-title]').textContent = content.title;
    demo.querySelector('[data-demo-copy]').textContent = content.copy;
    demo.querySelector('.result-bubble').textContent = content.result;
    demo.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.step === stage)));
  }
  function sync() {
    clearInterval(timer);
    clearInterval(exampleTimer);
    demo.classList.toggle('is-paused', paused || !visible);
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    toggle.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) {
      timer = setInterval(() => render(order[(order.indexOf(demo.dataset.stage) + 1) % order.length]), 7500);
      exampleTimer = setInterval(() => { if (demo.dataset.stage === 'train') { exampleIndex = (exampleIndex + 1) % 3; showExample(); } }, 2500);
    }
  }
  demo.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => { paused = true; render(button.dataset.step); sync(); }));
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold: .15}).observe(demo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInterval(timer); clearInterval(exampleTimer); demo.classList.add('is-paused'); } else sync(); });
  sync();
});
