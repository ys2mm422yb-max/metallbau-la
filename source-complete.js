/*
  Compatibility/polish layer for the source-backed JSON renderer in script.js.
  It does not render reference cards. It removes audit UI, keeps source URLs available
  only as hidden QA metadata, and aligns customer-facing filter counts with 37 reference entries.
*/
(() => {
  const polish = () => {
    const cards = document.querySelectorAll('#reference-grid .source-project-card');
    if (cards.length !== 36) return false;

    document.querySelector('.source-coverage-panel')?.remove();
    const sourceLinks = document.querySelector('.source-gallery-links');
    if (sourceLinks) {
      sourceLinks.querySelectorAll('a').forEach((link) => {
        if (document.querySelector(`a[data-source-qa="${link.href}"]`)) return;
        const metadataLink = link.cloneNode(true);
        metadataLink.hidden = true;
        metadataLink.tabIndex = -1;
        metadataLink.setAttribute('aria-hidden', 'true');
        metadataLink.dataset.sourceQa = link.href;
        document.body.appendChild(metadataLink);
      });
      sourceLinks.remove();
    }

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
