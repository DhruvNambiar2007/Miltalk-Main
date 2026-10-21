document.querySelectorAll('.site-nav .menu-toggle').forEach(button => {
  button.addEventListener('click', () => {
    // main.js handles opening the shared menu; keep its accessible state in sync.
    const isOpen = document.querySelector('.site-nav .nav-links')?.classList.contains('open');
    button.setAttribute('aria-expanded', String(Boolean(isOpen)));
    button.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('.site-nav .nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open menu');
    });
  });
});
