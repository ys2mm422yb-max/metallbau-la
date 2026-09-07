const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const form = document.querySelector('#project-form');
const files = document.querySelector('#files');
const fileStatus = document.querySelector('#file-status');
const formNote = document.querySelector('#form-note');
const projectType = document.querySelector('#project-type');
const filterChips = document.querySelectorAll('[data-filter]');
const referenceCards = document.querySelectorAll('.reference-card[data-category]');
const archiveItems = document.querySelectorAll('.archive-list [data-category]');
const filterLinks = document.querySelectorAll('[data-filter-link]');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

function closeNav() {
  document.body.classList.remove('nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Navigation öffnen');
}

function openNav() {
  document.body.classList.add('nav-open');
  navToggle?.setAttribute('aria-expanded', 'true');
  navToggle?.setAttribute('aria-label', 'Navigation schließen');
}

function scrollToTarget(target) {
  if (!target) return;
  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
  const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 12;
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
  filterChips.forEach((chip) => {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });

  [...referenceCards, ...archiveItems].forEach((item) => {
    const visible = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('is-hidden', !visible);
  });
}

filterChips.forEach((chip) => {
  chip.setAttribute('aria-pressed', String(chip.classList.contains('is-active')));
  chip.addEventListener('click', () => applyFilter(chip.dataset.filter || 'all'));
});

filterLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const filter = link.dataset.filterLink;
    const hasMatches = [...referenceCards, ...archiveItems].some((item) => item.dataset.category === filter);
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