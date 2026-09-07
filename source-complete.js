/*
  Category-first reference UX for the Larasser demo.
  The source-backed project data still stays complete in script.js/data/*.json,
  but the customer-facing page only reveals one reference category at a time.
*/
(() => {
  const LABELS = {
    treppen: 'Treppen & Geländer',
    tore: 'Tore & Zäune',
    balkone: 'Balkone & Terrassen',
    stahlbau: 'Carports, Dächer & Stahlbau',
    interior: 'Interior & Metallgestaltung',
    medallions: 'Medallions',
  };

  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  let menuLockY = null;
  let navigationEpoch = 0;

  function rememberMenuPosition() {
    if (document.body.classList.contains('nav-open')) return;
    menuLockY = Math.max(0, window.scrollY);
    document.body.dataset.navLockY = String(menuLockY);
  }

  function lockedMenuPosition() {
    if (Number.isFinite(menuLockY)) return Math.max(0, menuLockY);
    const stored = Number.parseFloat(document.body.dataset.navLockY || '');
    if (Number.isFinite(stored)) return Math.max(0, stored);
    const fromBodyTop = -(Number.parseFloat(document.body.style.top || '0') || 0);
    return Math.max(0, fromBodyTop || window.scrollY);
  }

  function clearMenuLock() {
    document.body.classList.remove('nav-open');
    Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '' });
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Navigation öffnen');
  }

  function restoreMenuPosition() {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const restoreY = lockedMenuPosition();
    navigationEpoch += 1;
    root.style.scrollBehavior = 'auto';
    clearMenuLock();
    window.scrollTo({ top: restoreY, left: 0, behavior: 'auto' });

    requestAnimationFrame(() => {
      window.scrollTo({ top: restoreY, left: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreY, left: 0, behavior: 'auto' });
        root.style.scrollBehavior = previousScrollBehavior;
        menuLockY = null;
        delete document.body.dataset.navLockY;
      });
    });
  }

  function alignTargetBelowHeader(target) {
    if (!target) return;
    const header = document.querySelector('.site-header');
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    const headerHeight = header?.getBoundingClientRect().height || 0;
    window.scrollBy({ top: -(headerHeight + 14), left: 0, behavior: 'auto' });
  }

  function closeMenuAndNavigate(anchor, target) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const restoreY = lockedMenuPosition();
    const token = ++navigationEpoch;

    root.style.scrollBehavior = 'auto';
    clearMenuLock();
    window.scrollTo({ top: restoreY, left: 0, behavior: 'auto' });
    history.replaceState?.(null, '', anchor.getAttribute('href'));

    const align = () => {
      if (token !== navigationEpoch) return;
      alignTargetBelowHeader(target);
    };

    // Mobile Safari/Chromium can settle the fixed-body release and browser chrome
    // over more than one frame. Re-align briefly against the live target geometry
    // so a menu tap always lands on the requested section instead of an old offset.
    requestAnimationFrame(() => {
      align();
      requestAnimationFrame(align);
    });
    setTimeout(align, 90);
    setTimeout(() => {
      align();
      if (token === navigationEpoch) {
        root.style.scrollBehavior = previousScrollBehavior;
        menuLockY = null;
        delete document.body.dataset.navLockY;
      }
    }, 260);
  }

  // Capture the real page position before script.js fixes the body in place.
  // This value stays authoritative even if Safari changes viewport geometry while
  // the full-screen menu is open.
  navToggle?.addEventListener('click', rememberMenuPosition, true);

  // Handle menu links before the generic document-level anchor handler in script.js.
  nav?.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    const target = hash ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    closeMenuAndNavigate(anchor, target);
  });

  // Escape closes the overlay and returns to the exact pre-menu position.
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !document.body.classList.contains('nav-open')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    restoreMenuPosition();
  }, true);

  // script.js originally binds the Medallion toggle while its gallery lives inside
  // #specialarbeiten. Category-first UX moves that gallery into #reference-grid, so
  // the old closure would search the now-detached parent. Handle the control in the
  // capture phase against its new live container and suppress that stale listener.
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('#reference-grid .medallion-toggle');
    if (!toggle) return;
    const gallery = toggle.closest('.medallions-inline')?.querySelector('.medallion-gallery');
    if (!gallery) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const expanded = gallery.dataset.expanded !== 'true';
    gallery.dataset.expanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    const count = gallery.querySelectorAll('.medallion-item').length;
    toggle.textContent = expanded ? 'Medaillon-Galerie einklappen' : `Alle ${count} Medaillon-Beispiele anzeigen`;
  }, true);

  let initialized = false;
  let selectedCategory = null;
  let medallionSection = null;
  let resultHeader = null;
  let resultTitle = null;
  let resultMeta = null;

  const projectCards = () => [...document.querySelectorAll('#reference-grid .source-project-card')];
  const chips = () => [...document.querySelectorAll('#referenzen .filter-chip[data-filter]')];

  function countFor(category) {
    if (category === 'medallions') {
      return medallionSection?.querySelectorAll('.medallion-item').length || 0;
    }
    return projectCards().filter((card) => card.dataset.category === category).length;
  }

  function updateBadges() {
    chips().forEach((chip) => {
      const category = chip.dataset.filter;
      if (!LABELS[category]) return;
      let badge = chip.querySelector('small');
      if (!badge) {
        badge = document.createElement('small');
        chip.appendChild(badge);
      }
      badge.textContent = String(countFor(category));
      chip.setAttribute('aria-label', `${LABELS[category]} – ${countFor(category)} ${category === 'medallions' ? 'Beispiele' : 'Projekte'}`);
    });
  }

  function showCategory(category, { scroll = false } = {}) {
    if (!LABELS[category]) return;
    selectedCategory = category;
    const section = document.querySelector('#referenzen');
    const grid = document.querySelector('#reference-grid');
    if (!section || !grid) return;

    section.classList.remove('references-awaiting-selection');
    document.querySelector('.reference-picker-note')?.classList.add('has-selection');

    projectCards().forEach((card) => {
      card.classList.toggle('is-hidden', category === 'medallions' || card.dataset.category !== category);
    });

    if (medallionSection) {
      medallionSection.hidden = category !== 'medallions';
      medallionSection.setAttribute('aria-hidden', String(category !== 'medallions'));
    }

    chips().forEach((chip) => {
      const active = chip.dataset.filter === category;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    const count = countFor(category);
    if (resultHeader && resultTitle && resultMeta) {
      resultHeader.hidden = false;
      resultTitle.textContent = LABELS[category];
      resultMeta.textContent = `${count} ${category === 'medallions' ? (count === 1 ? 'Beispiel' : 'Beispiele') : (count === 1 ? 'Projekt' : 'Projekte')}`;
    }

    if (scroll) {
      requestAnimationFrame(() => {
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        alignTargetBelowHeader(grid);
        requestAnimationFrame(() => {
          alignTargetBelowHeader(grid);
          root.style.scrollBehavior = previousScrollBehavior;
        });
      });
    }
  }

  function showOverview() {
    selectedCategory = null;
    const section = document.querySelector('#referenzen');
    if (!section) return;
    section.classList.add('references-awaiting-selection');
    document.querySelector('.reference-picker-note')?.classList.remove('has-selection');
    projectCards().forEach((card) => card.classList.add('is-hidden'));
    if (medallionSection) {
      medallionSection.hidden = true;
      medallionSection.setAttribute('aria-hidden', 'true');
    }
    chips().forEach((chip) => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });
    if (resultHeader) resultHeader.hidden = true;
  }

  function setupReferenceUX() {
    if (initialized) return true;

    const section = document.querySelector('#referenzen');
    const grid = document.querySelector('#reference-grid');
    const bar = section?.querySelector('.filter-bar');
    const cards = projectCards();
    const special = document.querySelector('#specialarbeiten');
    const medallions = special?.querySelector('.medallions-section');
    const medallionCount = medallions?.querySelectorAll('.medallion-item').length || 0;

    if (!section || !grid || !bar || cards.length !== 36 || !medallions || medallionCount === 0) return false;
    initialized = true;

    // Keep the verified Medallion content, but move it into the reference area so it
    // appears only after the Medallions category is selected.
    medallionSection = medallions;
    medallionSection.classList.remove('content-width');
    medallionSection.classList.add('medallions-inline');
    medallionSection.hidden = true;
    medallionSection.setAttribute('aria-hidden', 'true');
    medallionSection.querySelectorAll('.source-gallery-links').forEach((node) => node.remove());
    grid.appendChild(medallionSection);
    special.remove();

    // Remove duplicate/archive UI that made the main page unnecessarily long.
    document.querySelector('.archive-panel')?.remove();
    document.querySelector('.source-coverage-panel')?.remove();
    document.querySelector('.reference-tools')?.remove();
    document.querySelector('.site-nav a[href="#specialarbeiten"]')?.remove();

    // "Alle" mixed project groups and individual Medallion images and was misleading.
    bar.querySelector('[data-filter="all"]')?.remove();
    bar.classList.add('reference-category-bar');
    bar.setAttribute('aria-label', 'Referenzbereich auswählen');

    const pickerNote = document.createElement('p');
    pickerNote.className = 'reference-picker-note';
    pickerNote.textContent = 'Wählen Sie einen Bereich. Projekte und Bilder werden erst nach der Auswahl angezeigt.';
    bar.insertAdjacentElement('beforebegin', pickerNote);

    resultHeader = document.createElement('div');
    resultHeader.className = 'reference-result-head';
    resultHeader.hidden = true;
    resultHeader.innerHTML = '<button class="reference-back" type="button">← Bereiche</button><div><strong></strong><span></span></div>';
    resultTitle = resultHeader.querySelector('strong');
    resultMeta = resultHeader.querySelector('span');
    grid.insertAdjacentElement('beforebegin', resultHeader);

    resultHeader.querySelector('.reference-back')?.addEventListener('click', showOverview);

    bar.addEventListener('click', (event) => {
      const chip = event.target.closest('.filter-chip[data-filter]');
      if (!chip || !LABELS[chip.dataset.filter]) return;
      // script.js updates its own state on document; our view is authoritative afterwards.
      queueMicrotask(() => showCategory(chip.dataset.filter));
    });

    document.addEventListener('click', (event) => {
      const service = event.target.closest('[data-filter-link]');
      if (!service || !LABELS[service.dataset.filterLink]) return;
      queueMicrotask(() => showCategory(service.dataset.filterLink));
    });

    updateBadges();
    showOverview();
    return true;
  }

  if (!setupReferenceUX()) {
    const observer = new MutationObserver(() => {
      if (setupReferenceUX()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', setupReferenceUX, { once: true });
  }

  // Small public hook used only by browser QA to inspect the customer-facing selection state.
  window.__larasserReferenceUX = {
    get selectedCategory() { return selectedCategory; },
    showOverview,
  };
})();