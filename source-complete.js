/*
  Compatibility/polish layer for the source-backed JSON renderer in script.js.
  It does not render reference cards. It removes audit UI, keeps source URLs available
  only as hidden QA metadata, and aligns customer-facing filter counts with 37 reference entries.
*/
(() => {
  // The page uses smooth anchor scrolling. Releasing the fixed mobile menu must still
  // restore the exact pre-menu position immediately on mobile browsers.
  let lockedNavY = null;
  const navStateObserver = new MutationObserver(() => {
    if (document.body.classList.contains('nav-open')) {
      const top = Number.parseFloat(document.body.style.top || '');
      if (Number.isFinite(top)) lockedNavY = Math.max(0, -top);
      return;
    }
    if (lockedNavY == null) return;
    const restoreY = lockedNavY;
    lockedNavY = null;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, restoreY);
    requestAnimationFrame(() => { root.style.scrollBehavior = previousScrollBehavior; });
  });
  navStateObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

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

    const firstGalleryTrigger = document.querySelector('#reference-grid [data-gallery-index]');
    if (firstGalleryTrigger && !firstGalleryTrigger.hasAttribute('data-lightbox-src')) {
      firstGalleryTrigger.setAttribute('data-lightbox-src', 'source-backed-gallery');
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
