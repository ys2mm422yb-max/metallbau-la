(() => {
  'use strict';

  const root = document.body.dataset.root || '.';
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownButton = dropdown?.querySelector(':scope > button');

  const closeNav = () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  };

  navToggle?.addEventListener('click', () => {
    const open = !document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  dropdownButton?.addEventListener('click', () => {
    const open = !dropdown.classList.contains('is-open');
    dropdown.classList.toggle('is-open', open);
    dropdownButton.setAttribute('aria-expanded', String(open));
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeNav();
  });

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');
  let galleryImages = [];
  let galleryIndex = 0;

  const showLightboxImage = () => {
    if (!lightboxImage || !galleryImages.length) return;
    lightboxImage.src = galleryImages[galleryIndex];
    lightboxPrev?.toggleAttribute('hidden', galleryImages.length < 2);
    lightboxNext?.toggleAttribute('hidden', galleryImages.length < 2);
  };

  const openLightbox = (images, index = 0) => {
    if (!lightbox || !images?.length) return;
    galleryImages = images;
    galleryIndex = Math.max(0, Math.min(index, images.length - 1));
    showLightboxImage();
    document.body.classList.add('lightbox-open');
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.close?.();
    document.body.classList.remove('lightbox-open');
    if (lightboxImage) lightboxImage.src = '';
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightboxPrev?.addEventListener('click', () => {
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightboxImage();
  });
  lightboxNext?.addEventListener('click', () => {
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    showLightboxImage();
  });
  window.addEventListener('keydown', (event) => {
    if (!lightbox?.open) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') lightboxPrev?.click();
    if (event.key === 'ArrowRight') lightboxNext?.click();
  });

  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const assetPath = (path) => `${root}/${path}`.replace('/./', '/');

  async function renderProjectCategory() {
    const list = document.querySelector('[data-project-list]');
    const category = document.body.dataset.category;
    if (!list || !category) return;

    try {
      const response = await fetch(assetPath(`data/${category}.json`), { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.projects)) throw new Error('Invalid project data');

      list.innerHTML = payload.projects.map((project, projectIndex) => {
        const images = project.images || [];
        const description = project.description && project.description !== '.'
          ? `<p>${esc(project.description.replace(/\.\.$/, '.'))}</p>`
          : '';
        return `<article class="project" data-project-index="${projectIndex}">
          <div class="project-meta">
            <span class="project-year">${esc(project.year || '')}</span>
            <div class="project-heading">
              <h2>${esc((project.title || '').replace('Gartenzaunanlage/Tore', 'Gartenzaunanlage/Tore'))}</h2>
              ${description}
            </div>
          </div>
          <div class="gallery" data-gallery="${projectIndex}">
            ${images.map((src, imageIndex) => `<button type="button" data-gallery-image="${imageIndex}" aria-label="${esc(project.title)} – Bild ${imageIndex + 1} vergrößern"><img src="${assetPath(src)}" alt="${imageIndex === 0 ? esc(project.title) : ''}" loading="${projectIndex < 2 ? 'eager' : 'lazy'}" decoding="async"></button>`).join('')}
          </div>
        </article>`;
      }).join('');

      payload.projects.forEach((project, projectIndex) => {
        const gallery = list.querySelector(`[data-gallery="${projectIndex}"]`);
        const images = (project.images || []).map(assetPath);
        gallery?.querySelectorAll('[data-gallery-image]').forEach((button) => {
          button.addEventListener('click', () => openLightbox(images, Number(button.dataset.galleryImage || 0)));
        });
      });
    } catch (error) {
      console.error('Projektgalerie konnte nicht geladen werden.', error);
      list.innerHTML = '<p>Die Projektgalerie konnte in dieser Vorschau nicht geladen werden.</p>';
    }
  }

  async function renderMedallions() {
    const grid = document.querySelector('[data-medallion-grid]');
    if (!grid) return;
    try {
      const response = await fetch(assetPath('data/medallions.json'), { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const images = (payload.images || []).map(assetPath);
      grid.innerHTML = images.map((src, index) => `<button type="button" data-medallion="${index}" aria-label="Medaillon Beispiel ${index + 1} vergrößern"><img src="${src}" alt="Bronze-Medaillon – Beispiel ${index + 1}" loading="lazy" decoding="async"></button>`).join('');
      grid.querySelectorAll('[data-medallion]').forEach((button) => {
        button.addEventListener('click', () => openLightbox(images, Number(button.dataset.medallion)));
      });
    } catch (error) {
      console.error('Medaillon-Galerie konnte nicht geladen werden.', error);
      grid.innerHTML = '<p>Die Medaillon-Galerie konnte in dieser Vorschau nicht geladen werden.</p>';
    }
  }

  function bindStaticGalleries() {
    document.querySelectorAll('[data-static-gallery]').forEach((gallery) => {
      const items = [...gallery.querySelectorAll('button[data-src]')];
      const images = items.map((item) => assetPath(item.dataset.src));
      items.forEach((button, index) => button.addEventListener('click', () => openLightbox(images, index)));
    });
  }

  function bindContactForm() {
    const form = document.querySelector('#project-form');
    if (!form) return;
    const note = form.querySelector('.form-note');
    const endpoint = window.LARASSER_CONFIG?.formEndpoint || '';
    const recipient = window.LARASSER_CONFIG?.recipient || 'info@larasser-metallbau.de';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const files = [...(form.querySelector('input[type="file"]')?.files || [])];
      const tooLarge = files.some((file) => file.size > 10 * 1024 * 1024);
      const total = files.reduce((sum, file) => sum + file.size, 0);
      if (tooLarge || total > 25 * 1024 * 1024) {
        if (note) note.textContent = 'Bitte maximal 10 MB pro Datei und 25 MB insgesamt auswählen.';
        return;
      }

      if (endpoint) {
        try {
          form.setAttribute('aria-busy', 'true');
          const response = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          form.reset();
          if (note) note.textContent = 'Danke. Die Anfrage wurde versendet.';
          return;
        } catch (error) {
          console.error('Formularversand fehlgeschlagen.', error);
          if (note) note.textContent = 'Der direkte Versand ist fehlgeschlagen. Bitte nutzen Sie E-Mail oder Telefon.';
        } finally {
          form.removeAttribute('aria-busy');
        }
        return;
      }

      const data = new FormData(form);
      const lines = [
        `Name: ${data.get('name') || ''}`,
        `E-Mail: ${data.get('email') || ''}`,
        `Telefon: ${data.get('phone') || ''}`,
        `Projektart: ${data.get('project-type') || ''}`,
        '',
        `${data.get('message') || ''}`,
      ];
      const subject = encodeURIComponent(`Projektanfrage über larasser-metallbau.de – ${data.get('project-type') || 'Metallbau'}`);
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      if (note) note.textContent = 'Demo-Modus: Die Anfrage wurde als E-Mail vorbereitet. Dateianhänge müssen in der E-Mail ergänzt werden.';
    });
  }

  renderProjectCategory();
  renderMedallions();
  bindStaticGalleries();
  bindContactForm();
})();
