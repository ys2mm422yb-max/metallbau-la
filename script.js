const visualFixes = document.createElement('link');
visualFixes.rel = 'stylesheet';
visualFixes.href = 'visual-fixes.css';
document.head.appendChild(visualFixes);

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const form = document.querySelector('#project-form');
const files = document.querySelector('#files');
const fileStatus = document.querySelector('#file-status');
const formNote = document.querySelector('#form-note');
const projectType = document.querySelector('#project-type');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

let navScrollY = 0;

function addVerifiedSourceCoverage() {
  const archiveList = document.querySelector('.archive-list');
  if (archiveList) {
    const knownTitles = new Set(
      [...archiveList.querySelectorAll('strong')].map((node) => node.textContent.trim())
    );

    const verifiedProjects = [
      ['treppen', '2015', 'Geschwungene Stahltreppe', 'Treppen & Geländer'],
      ['treppen', '2016', 'Treppengeländer im Handwerkerhaus', 'Treppen & Geländer'],
      ['tore', '2019', 'Friedhofstor & Zaunanlage', 'Tore & Zäune'],
      ['balkone', '2022', 'Terrasse mit Geländer', 'Balkone & Terrassen'],
      ['balkone', '2016', 'Geschmiedeter Balkon', 'Balkone & Terrassen'],
    ];

    verifiedProjects.forEach(([category, year, title, label]) => {
      if (knownTitles.has(title)) return;
      const item = document.createElement('div');
      item.dataset.category = category;
      item.innerHTML = `<span>${year}</span><strong>${title}</strong><small>${label}</small>`;
      archiveList.appendChild(item);
    });
  }

  const archivePanel = document.querySelector('.archive-panel');
  if (archivePanel && !archivePanel.querySelector('.source-category-links')) {
    const sourceLinks = document.createElement('div');
    sourceLinks.className = 'source-category-links';
    sourceLinks.innerHTML = `
      <span>Weitere Referenzbereiche der bestehenden Website</span>
      <div>
        <a href="https://www.larasser-metallbau.de/referenzen/interior/" target="_blank" rel="noopener">Interior ↗</a>
        <a href="https://www.larasser-metallbau.de/referenzen/medallions/" target="_blank" rel="noopener">Medallions ↗</a>
      </div>
    `;
    archivePanel.appendChild(sourceLinks);
  }

  const teamCards = document.querySelectorAll('.team-strip > div');
  const teamPhones = [
    ['+49 171 5248966', '+491715248966'],
    ['+49 177 3248147', '+491773248147'],
  ];
  teamCards.forEach((card, index) => {
    if (card.querySelector('.team-phone') || !teamPhones[index]) return;
    const phone = document.createElement('a');
    phone.className = 'team-phone';
    phone.href = `tel:${teamPhones[index][1]}`;
    phone.textContent = teamPhones[index][0];
    card.appendChild(phone);
  });

  const footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom && !footerBottom.querySelector('.legal-links')) {
    const legal = document.createElement('span');
    legal.className = 'legal-links';
    legal.innerHTML = `
      <a href="https://www.larasser-metallbau.de/impressum/" target="_blank" rel="noopener">Impressum</a>
      <a href="https://www.larasser-metallbau.de/datenschutzerklarung/" target="_blank" rel="noopener">Datenschutz</a>
    `;
    footerBottom.appendChild(legal);
  }
}

addVerifiedSourceCoverage();

function getFilterChips() {
  return [...document.querySelectorAll('[data-filter]')];
}

function getFilterableItems() {
  return [
    ...document.querySelectorAll('.reference-card[data-category]'),
    ...document.querySelectorAll('.archive-list [data-category]'),
  ];
}

function unlockBodyAfterNav() {
  const wasFixed = document.body.style.position === 'fixed';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  if (wasFixed) window.scrollTo(0, navScrollY);
}

function closeNav() {
  const wasOpen = document.body.classList.contains('nav-open');
  document.body.classList.remove('nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Navigation öffnen');
  if (wasOpen) unlockBodyAfterNav();
}

function openNav() {
  navScrollY = window.scrollY;
  document.body.classList.add('nav-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${navScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  navToggle?.setAttribute('aria-expanded', 'true');
  navToggle?.setAttribute('aria-label', 'Navigation schließen');
}

function scrollToTarget(target) {
  if (!target) return;
  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
  const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 14;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

navToggle?.addEventListener('click', () => {
  document.body.classList.contains('nav-open') ? closeNav() : openNav();
});

navLinks.forEach((link) => link.addEventListener('click', closeNav));

window.addEventListener('resize', () => {
  if (window.innerWidth > 1040) closeNav();
});

function applyFilter(filter) {
  getFilterChips().forEach((chip) => {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });

  getFilterableItems().forEach((item) => {
    const visible = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('is-hidden', !visible);
  });
}

getFilterChips().forEach((chip) => {
  chip.setAttribute('aria-pressed', String(chip.classList.contains('is-active')));
  chip.addEventListener('click', () => applyFilter(chip.dataset.filter || 'all'));
});

document.querySelectorAll('[data-filter-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const filter = link.dataset.filterLink;
    const hasMatches = getFilterableItems().some((item) => item.dataset.category === filter);
    if (filter && hasMatches) applyFilter(filter);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    closeNav();
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, '', hash);
  });
});

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
  document.body.classList.remove('lightbox-open');
}

document.querySelectorAll('[data-lightbox-src]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.lightboxSrc || '';
    lightboxImage.alt = button.dataset.lightboxAlt || '';
    document.body.classList.add('lightbox-open');
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener('close', () => document.body.classList.remove('lightbox-open'));

files?.addEventListener('change', () => {
  const selected = [...files.files];
  if (!selected.length) {
    fileStatus.textContent = 'Optional – Bilder oder PDF auswählen';
    return;
  }

  fileStatus.textContent = selected.length === 1
    ? selected[0].name
    : `${selected.length} Dateien ausgewählt`;
});

document.querySelectorAll('[data-prefill]').forEach((link) => {
  link.addEventListener('click', () => {
    const value = link.dataset.prefill;
    const option = [...projectType.options].find((item) => item.text === value);
    if (option) projectType.value = value;
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNav();
    closeLightbox();
  }
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const selectedFiles = [...files.files].map((file) => file.name);
  const lines = [
    'Guten Tag,',
    '',
    'ich möchte folgendes Projekt anfragen:',
    '',
    `Projektart: ${data.get('project-type') || '—'}`,
    `Material: ${data.get('material') || '—'}`,
    `Maße: ${data.get('dimensions') || '—'}`,
    `Stückzahl: ${data.get('quantity') || '—'}`,
    `Ort / PLZ: ${data.get('location') || '—'}`,
    '',
    'Beschreibung:',
    data.get('details') || '—',
    '',
    `Name: ${data.get('name') || '—'}`,
    `E-Mail: ${data.get('email') || '—'}`,
    `Telefon: ${data.get('phone') || '—'}`,
    '',
    selectedFiles.length
      ? `Ausgewählte Anhänge: ${selectedFiles.join(', ')} (bitte im Mailprogramm manuell anhängen)`
      : 'Anhänge: keine ausgewählt',
    '',
    'Viele Grüße'
  ];

  const subject = `Projektanfrage – ${data.get('project-type') || 'Metallbau'}`;
  const mailto = `mailto:info@larasser-metallbau.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  formNote.textContent = 'E-Mail wird vorbereitet. Ausgewählte Dateien bitte im Mailprogramm manuell anhängen.';
  window.location.href = mailto;
});