document.querySelectorAll('[data-sorter]').forEach(demo => {
  const stages = {
    train: { number: '01 · Teach the categories', title: 'Start with labelled examples.', copy: 'Children label paper and cans as recyclable, and used tissues as general waste. The kit learns from these examples.', items: ['paper', 'can', 'tissue'] },
    test: { number: '02 · Try a new object', title: 'Where does the bottle go?', copy: 'Here, the model has only seen paper and cans as recyclable. It predicts general waste for a new bottle. Children spot the mistake when the bottle goes to the wrong bin.', items: ['bottle'] },
    improve: { number: '03 · Add data and retry', title: 'Give it a better example.', copy: 'Add a labelled bottle to the recyclable examples, then try another bottle. In this illustration, the updated model sends it to the recycling bin.', items: ['bottle'] }
  };
  const order = Object.keys(stages);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const item = demo.querySelector('[data-moving-item]');
  const itemUse = demo.querySelector('[data-item]');
  const servo = demo.querySelector('[data-servo]');
  const screen = demo.querySelector('[data-screen]');
  const screenSub = demo.querySelector('[data-screen-sub]');
  const status = demo.querySelector('[data-scene-status]');
  const pause = demo.querySelector('.sorter-pause');
  const objectName = demo.querySelector('[data-object-name]');
  const labels = {paper: 'Paper', can: 'Can', tissue: 'Used tissue', bottle: 'Plastic bottle'};
  let stage = 'train', elapsed = 0, paused = reduced.matches, visible = false, frame = 0, last = 0, lastLabel = '';
  const duration = 5800;
  const ease = n => n * n * (3 - 2 * n);
  function draw(time) {
    const content = stages[stage];
    const index = Math.min(content.items.length - 1, Math.floor(time / duration));
    const type = content.items[index];
    const progress = (time % duration) / duration;
    const recyclable = type !== 'tissue' && stage !== 'test';
    const destination = recyclable ? 801 : 920;
    const result = recyclable ? 'Recyclable' : 'General waste';
    let x = 110, y = 294, rotate = 0, opacity = 1;
    let phase = 'arrive';
    if (progress < .28) x += (476 - 110) * ease(progress / .28);
    else if (progress < .57) { x = 476; phase = 'scan'; }
    else if (progress < .76) { x = 476 + (704 - 476) * ease((progress - .57) / .19); phase = 'sort'; }
    else {
      const fall = ease(Math.min(1, (progress - .76) / .2));
      x = 704 + (destination - 704) * fall;
      y = 294 + 184 * fall * fall;
      rotate = (recyclable ? -1 : 1) * fall * 35;
      opacity = progress > .93 ? Math.max(0, (1 - progress) / .07) : 1;
      phase = 'drop';
    }
    item.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rotate.toFixed(1) + ')');
    item.style.opacity = opacity;
    itemUse.setAttribute('href', '#item-' + type);
    const arm = progress > .5 ? (recyclable ? 43 : 20) : 0;
    servo.setAttribute('transform', 'translate(710 349) rotate(' + arm + ')');
    demo.style.setProperty('--sorter-progress', (time / (duration * content.items.length) * 100).toFixed(1) + '%');
    const key = stage + type + phase;
    if (key !== lastLabel) {
      lastLabel = key;
      demo.dataset.phase = phase;
      demo.dataset.destination = recyclable ? 'recycle' : 'general';
      objectName.textContent = labels[type].toUpperCase();
      if (phase === 'arrive') {
        screen.textContent = stage === 'train' ? 'Learning' : 'Ready';
        screenSub.textContent = stage === 'train' ? 'Label an example' : 'New test object';
        status.textContent = 'Moving to the scanner';
      } else if (phase === 'scan') {
        screen.textContent = stage === 'train' ? 'Learning' : 'Scanning';
        screenSub.textContent = labels[type];
        status.textContent = stage === 'train' ? 'Label: ' + result : 'Checking the new object';
      } else {
        screen.textContent = result;
        screenSub.textContent = stage === 'train' ? 'Example saved' : stage === 'test' ? 'Wrong prediction' : 'Correct prediction';
        status.textContent = stage === 'test' ? 'Wrong bin. Check the data.' : stage === 'train' ? 'Labelled example saved' : 'Updated data. Correct bin.';
      }
    }
  }
  function setStage(next) {
    stage = next; elapsed = 0; lastLabel = ''; last = 0;
    const data = stages[stage];
    demo.dataset.stage = stage;
    demo.querySelector('[data-demo-number]').textContent = data.number;
    demo.querySelector('[data-demo-title]').textContent = data.title;
    demo.querySelector('[data-demo-copy]').textContent = data.copy;
    demo.querySelector('[data-training]').textContent = stage === 'improve' ? 'Paper · can · bottle' : 'Paper · can';
    demo.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.step === stage)));
    draw(reduced.matches ? duration * .86 : 0);
  }
  function tick(now) {
    if (!last) last = now;
    elapsed += Math.min(now - last, 80); last = now;
    if (elapsed >= stages[stage].items.length * duration) setStage(order[(order.indexOf(stage) + 1) % order.length]);
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); last = 0;
    const active = !paused && visible && !document.hidden;
    demo.classList.toggle('is-paused', !active);
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-pressed', String(paused));
    if (active) frame = requestAnimationFrame(tick);
  }
  demo.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => { setStage(button.dataset.step); sync(); }));
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', event => { paused = event.matches; setStage(stage); sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold: .1}).observe(demo);
  document.addEventListener('visibilitychange', sync);
  setStage('train'); sync();
});
