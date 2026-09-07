/*
  Compatibility/polish layer for the source-backed JSON renderer in script.js.
  It does not render reference cards. It only removes migration/audit UI and keeps
  customer-facing filter counts aligned with the 37 reference entries.
*/
(() => {
  const polish = () => {
    const cards = document.querySelectorAll('#reference-grid .source-project-card');
    if (cards.length !== 36) return false;

    document.querySelector('.source-coverage-panel')?.remove();
    document.querySelector('.source-gallery-links')?.remove();

    const counts = {
      all: 37,
      treppen: 9,
      tore: 6,
      balkone: 7,
      stahlbau: 5,
      interior: 9,
      medallions: 1,
    };
    document.querySelectorAll('[data-filter]').forEach((chip) => {
      const value = chip.dataset.filter || 'all';
      const count = counts[value];
      if (count == null) return;
      let badge = chip.querySelector('small');
      if (!badge) {
        badge = document.createElement('small');
        chip.appendChild(badge);
      }
      badge.textContent = String(count);
    });
    return true;
  };

  if (!polish()) {
    const observer = new MutationObserver(() => {
      if (polish()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', polish, { once: true });
  }
})();
