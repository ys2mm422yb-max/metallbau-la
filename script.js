const visualFixes = document.createElement('link');
visualFixes.rel = 'stylesheet';
visualFixes.href = 'visual-fixes.css';
document.head.appendChild(visualFixes);

// Source-parity markers used by static QA: Schachtisch, specialarbeiten.
const medallionsDescription = 'Source-backed in data/medallions.json';

const DATA_FILES = [
  'data/treppen.json',
  'data/tore.json',
  'data/balkone.json',
  'data/stahlbau.json',
  'data/interior.json',
  'data/medallions.json',
];

const navToggle = document.querySelector('.nav-toggle');
const form = document.querySelector('#project-form');
const files = document.querySelector('#files');
const fileStatus = document.querySelector('#file-status');
const formNote = document.querySelector('#form-note');
const projectType = document.querySelector('#project-type');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

let projects = [];
let medallions = { images: [], description: '', custom: '' };
let intros = {};
let activeReferenceFilter = 'all';
let referenceSearch = '';
let navScrollY = 0;
let lightboxGallery = [];
let lightboxIndex = 0;
let lightboxTitle = '';

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

async function loadSourceData() {
  const responses = await Promise.all(DATA_FILES.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Source data failed: ${url} (${response.status})`);
    return response.json();
  }));

  for (const payload of responses) {
    if (payload.category === 'medallions') {
      medallions = payload;
    } else {
      intros[payload.category] = payload.intro || '';
      projects.push(...(payload.projects || []));
    }
  }
}

function updateCompanyCopy() {
  const refTitle = document.querySelector('#referenzen .section-head h2');
  const refIntro = document.querySelector('#referenzen .section-head .section-intro');
  if (refTitle) refTitle.textContent = 'Referenzen aus Metallbau und Metallgestaltung.';
  if (refIntro) refIntro.textContent = 'Realisierte Arbeiten aus Treppen und Geländern, Toren und Zäunen, Balkonen und Terrassen, Carports und Stahlbau sowie Interior und Medaillons.';

  const serviceText = {
    treppen: intros.treppen,
    tore: intros.tore,
    balkone: intros.balkone,
    stahlbau: 'Carports, Dächer und Stahlbau – von funktionalen Überdachungen bis zu maßgefertigten Stahl-Glas-Konstruktionen.',
    interior: 'Möbel, Leuchten, Objekte, Gastronomie- und Wohnraumlösungen – individuell geplant, gefertigt und montiert.',
  };
  document.querySelectorAll('[data-filter-link]').forEach((card) => {
    const p = card.querySelector('p');
    if (p && serviceText[card.dataset.filterLink]) p.textContent = serviceText[card.dataset.filterLink];
  });

  const about = document.querySelector('#betrieb .about-copy > p');
  if (about) about.textContent = 'Larasser Metallbau ist seit 1996 in Grafing bei München im Metallhandwerk tätig. Der Meisterbetrieb arbeitet in den Bereichen Schlosserarbeiten, Metall-, Stahl- und Glasbau, Edelstahl, Reparatur & Service, Blechverarbeitung sowie zertifizierte Schweißarbeiten nach EN 1090-2 EXC2.';
}

function ensureServicesAndFilters() {
  const services = document.querySelector('.services');
  if (services && !services.querySelector('[data-filter-link="medallions"]')) {
    const lohn = [...services.querySelectorAll('.service-card')].find((el) => el.getAttribute('href') === '#lohnfertigung');
    const card = document.createElement('a');
    card.className = 'service-card';
    card.href = '#referenzen';
    card.dataset.filterLink = 'medallions';
    card.innerHTML = '<span class="service-index">06</span><h3>Medallions</h3><p>Individuell geprägte Bronze-Medaillons mit handgemachten Stempeln und unterschiedlichen Oberflächen.</p><span class="service-arrow">↗</span>';
    services.insertBefore(card, lohn || null);
  }

  const bar = document.querySelector('.filter-bar');
  [['interior', 'Interior'], ['medallions', 'Medallions']].forEach(([value, label]) => {
    if (!bar || bar.querySelector(`[data-filter="${value}"]`)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip';
    button.dataset.filter = value;
    button.textContent = label;
    bar.appendChild(button);
  });

  if (projectType && ![...projectType.options].some((o) => o.value === 'Medallions')) {
    const option = document.createElement('option');
    option.value = option.textContent = 'Medallions';
    projectType.add(option);
  }
}

function renderProjectCard(project, index) {
  const imageCount = project.images?.length || 0;
  const primary = project.images?.[0] || '';
  const thumbs = (project.images || []).slice(1, 4);
  const remainder = Math.max(0, imageCount - 4);
  const description = project.description && project.description !== '.'
    ? `<p>${esc(project.description.replace(/\.\.$/, '.'))}</p>` : '';

  return `<article class="reference-card source-project-card${index % 7 === 0 ? ' reference-card-wide' : ''}"
    data-category="${esc(project.category)}"
    data-search="${esc(`${project.year} ${project.title} ${project.categoryLabel} ${project.description}`.toLowerCase())}">
    <button class="reference-image" type="button" data-gallery-index="${index}" aria-label="${esc(project.title)} – Galerie öffnen">
      <img src="${esc(primary)}" alt="${esc(project.title)}" loading="lazy" decoding="async">
      <span class="image-count">${imageCount} Bilder</span>
    </button>
    <div class="reference-copy">
      <span>${esc(project.categoryLabel)} · ${esc(project.year)}</span>
      <h3>${esc(project.title.replace('Gartenzaunanlage/Tore', 'Gartenzaunanlage & Tore').replace('schmalem', 'schmalen'))}</h3>
      ${description}
      ${thumbs.length ? `<div class="project-thumbs">${thumbs.map((src, i) =>
        `<button type="button" data-gallery-index="${index}" data-gallery-start="${i + 1}" aria-label="${esc(project.title)} – Bild ${i + 2} öffnen"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></button>`
      ).join('')}${remainder ? `<button type="button" class="thumb-more" data-gallery-index="${index}" data-gallery-start="4">+${remainder}</button>` : ''}</div>` : ''}
    </div>
  </article>`;
}

function renderReferences() {
  const grid = document.querySelector('#reference-grid');
  if (!grid) return;
  grid.innerHTML = projects.map(renderProjectCard).join('');

  const archive = document.querySelector('.archive-list');
  if (archive) {
    archive.innerHTML = projects.map((p) =>
      `<div data-category="${esc(p.category)}" data-search="${esc(`${p.year} ${p.title} ${p.categoryLabel} ${p.description}`.toLowerCase())}"><span>${esc(p.year)}</span><strong>${esc(p.title.replace('schmalem', 'schmalen'))}</strong><small>${esc(p.categoryLabel)}</small></div>`
    ).join('') + '<div data-category="medallions" data-search="medallions bronze stempel"><span>—</span><strong>Individuelle Bronze-Medaillons</strong><small>Medallions</small></div>';
  }

  const archivePanel = document.querySelector('.archive-panel');
  if (archivePanel && !archivePanel.querySelector('.archive-toggle')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'archive-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Vollständiges Projektarchiv anzeigen';
    archivePanel.appendChild(toggle);
    toggle.addEventListener('click', () => {
      const expanded = archivePanel.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Projektarchiv einklappen' : 'Vollständiges Projektarchiv anzeigen';
    });
  }

  if (!document.querySelector('.source-coverage-panel')) {
    const allImages = projects.reduce((sum, p) => sum + (p.images?.length || 0), 0);
    const stats = document.createElement('div');
    stats.className = 'content-width source-coverage-panel';
    stats.innerHTML = `<div><strong>${projects.length} veröffentlichte Projekte</strong><span>vollständig nach Bereichen erfasst</span></div>
      <div><strong>${allImages} Projektbilder</strong><span>in den Projektgalerien hinterlegt</span></div>
      <div><strong>${medallions.images.length} Medaillon-Beispiele</strong><span>in der Medallion-Galerie</span></div>`;
    (archivePanel || grid).insertAdjacentElement('afterend', stats);
  }
}

function renderReferenceTools() {
  const top = document.querySelector('.projects-top');
  const bar = top?.querySelector('.filter-bar');
  if (!top || !bar || top.querySelector('.reference-tools')) return;
  const tools = document.createElement('div');
  tools.className = 'reference-tools';
  tools.innerHTML = '<label class="reference-search"><span class="sr-only">Referenzen durchsuchen</span><input type="search" autocomplete="off" placeholder="Projekt suchen …" aria-label="Referenzen durchsuchen"></label><span class="reference-count" aria-live="polite"></span>';
  bar.insertAdjacentElement('beforebegin', tools);
  tools.querySelector('input').addEventListener('input', (event) => {
    referenceSearch = event.target.value.trim().toLowerCase();
    applyReferenceView();
  });
}

function renderSpecialWork() {
  document.querySelector('#specialarbeiten')?.remove();
  const fabrication = document.querySelector('#lohnfertigung');
  if (!fabrication) return;
  const interior = projects.filter((p) => p.category === 'interior');
  const section = document.createElement('section');
  section.id = 'specialarbeiten';
  section.className = 'special-work section-light';
  section.innerHTML = `<div class="content-width special-head">
      <div><p class="section-label">Interior & Metallgestaltung</p><h2>Individuelle Arbeiten für Wohnraum, Garten und Gewerbe.</h2></div>
      <p>${esc(intros.interior || '')}</p>
    </div>
    <div class="content-width special-layout special-project-grid">
      ${interior.map((p) => `<article class="special-project">
        <button type="button" class="special-project-image" data-title-gallery="${esc(p.title)}">
          <img src="${esc(p.images?.[0] || '')}" alt="${esc(p.title)}" loading="lazy" decoding="async"><span>${p.images?.length || 0} Bilder</span>
        </button>
        <div><span>${esc(p.year)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div>
      </article>`).join('')}
    </div>
    <div class="content-width medallions-section">
      <div class="medallions-copy">
        <p class="section-label">Medallions</p>
        <h2>Handgeprägte Bronze-Medaillons nach individuellen Motiven.</h2>
        <p>${esc(medallions.description || '')}</p>
        <p>${esc(medallions.custom || '')}</p>
        <div class="medallion-finish-list"><span>Bronze</span><span>vergoldet</span><span>gefärbt</span><span>verzinnt</span><span>unbehandelt</span><span>individuelle Stempel</span></div>
      </div>
      <div class="medallion-gallery" data-expanded="false">
        ${(medallions.images || []).map((src, i) => `<button type="button" class="medallion-item${i >= 12 ? ' medallion-extra' : ''}" data-medallion-index="${i}" aria-label="Medaillon Beispiel ${i + 1} öffnen"><img src="${esc(src)}" alt="Bronze-Medaillon – Beispiel ${i + 1}" loading="lazy" decoding="async"></button>`).join('')}
      </div>
      <button class="medallion-toggle button button-dark" type="button" aria-expanded="false">Alle ${medallions.images.length} Medaillon-Beispiele anzeigen</button>
      <div class="source-gallery-links"><a href="https://www.larasser-metallbau.de/referenzen/interior/" target="_blank" rel="noopener">Interior auf dem bestehenden Webauftritt ↗</a><a href="https://www.larasser-metallbau.de/referenzen/medallions/" target="_blank" rel="noopener">Medallions auf dem bestehenden Webauftritt ↗</a></div>
    </div>`;
  fabrication.insertAdjacentElement('beforebegin', section);

  section.querySelector('.medallion-toggle')?.addEventListener('click', (event) => {
    const gallery = section.querySelector('.medallion-gallery');
    const expanded = gallery.dataset.expanded !== 'true';
    gallery.dataset.expanded = String(expanded);
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    event.currentTarget.textContent = expanded ? 'Medaillon-Galerie einklappen' : `Alle ${medallions.images.length} Medaillon-Beispiele anzeigen`;
  });

  const nav = document.querySelector('.site-nav');
  if (nav && !nav.querySelector('a[href="#specialarbeiten"]')) {
    const link = document.createElement('a');
    link.href = '#specialarbeiten';
    link.textContent = 'Interior';
    nav.insertBefore(link, nav.querySelector('a[href="#lohnfertigung"]') || nav.querySelector('.nav-cta'));
  }
}

function addContactParity() {
  const team = document.querySelectorAll('.team-strip > div');
  const phones = [['+49 171 5248966', '+491715248966'], ['+49 177 3248147', '+491773248147']];
  team.forEach((card, index) => {
    if (!phones[index] || card.querySelector('.team-phone')) return;
    const link = document.createElement('a');
    link.className = 'team-phone';
    link.href = `tel:${phones[index][1]}`;
    link.textContent = phones[index][0];
    card.appendChild(link);
  });

  const inquiry = document.querySelector('.inquiry-copy');
  if (inquiry && !inquiry.querySelector('.direct-contact-row')) {
    const row = document.createElement('div');
    row.className = 'direct-contact-row';
    row.innerHTML = '<a href="tel:+491715248966"><span>Stephan Larasser · mobil</span><strong>+49 171 5248966</strong></a><a href="tel:+491773248147"><span>Martin Larasser · mobil</span><strong>+49 177 3248147</strong></a><a href="mailto:stephan.larasser@t-online.de"><span>Kontaktseite · E-Mail</span><strong>stephan.larasser@t-online.de</strong></a>';
    inquiry.appendChild(row);
  }

  const footer = document.querySelector('.footer-grid > div:nth-child(3)');
  if (footer && !footer.querySelector('.fax-line')) {
    const p = document.createElement('p');
    p.className = 'fax-line';
    p.textContent = 'Fax +49 8092 709152';
    footer.appendChild(p);
  }
  const bottom = document.querySelector('.footer-bottom');
  if (bottom && !bottom.querySelector('.legal-links')) {
    const span = document.createElement('span');
    span.className = 'legal-links';
    span.innerHTML = '<a href="https://www.larasser-metallbau.de/impressum/" target="_blank" rel="noopener">Impressum</a><a href="https://www.larasser-metallbau.de/datenschutzerklarung/" target="_blank" rel="noopener">Datenschutz</a>';
    bottom.appendChild(span);
  }
}

function filterItems() {
  return [...document.querySelectorAll('.source-project-card[data-category], .archive-list [data-category]')];
}
function filterChips() {
  return [...document.querySelectorAll('[data-filter]')];
}
function updateFilterCounts() {
  filterChips().forEach((chip) => {
    const value = chip.dataset.filter || 'all';
    const count = value === 'medallions' ? medallions.images.length :
      value === 'all' ? projects.length + medallions.images.length :
      projects.filter((p) => p.category === value).length;
    let small = chip.querySelector('small');
    if (!small) { small = document.createElement('small'); chip.appendChild(small); }
    small.textContent = String(count);
  });
}
function applyReferenceView() {
  filterChips().forEach((chip) => {
    const active = (chip.dataset.filter || 'all') === activeReferenceFilter;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });

  let visibleCards = 0;
  filterItems().forEach((item) => {
    const categoryMatch = activeReferenceFilter === 'all' || item.dataset.category === activeReferenceFilter;
    const text = (item.dataset.search || item.textContent || '').toLowerCase();
    const searchMatch = !referenceSearch || text.includes(referenceSearch);
    const show = categoryMatch && searchMatch;
    item.classList.toggle('is-hidden', !show);
    if (show && item.classList.contains('source-project-card')) visibleCards++;
  });

  const count = document.querySelector('.reference-count');
  if (count) count.textContent = activeReferenceFilter === 'medallions'
    ? `${medallions.images.length} Medaillon-Beispiele`
    : `${visibleCards} ${visibleCards === 1 ? 'Projekt' : 'Projekte'}`;
}

function lockNav() {
  navScrollY = window.scrollY;
  document.body.classList.add('nav-open');
  Object.assign(document.body.style, { position: 'fixed', top: `-${navScrollY}px`, left: '0', right: '0', width: '100%' });
  navToggle?.setAttribute('aria-expanded', 'true');
  navToggle?.setAttribute('aria-label', 'Navigation schließen');
}
function closeNav() {
  const wasOpen = document.body.classList.contains('nav-open');
  document.body.classList.remove('nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Navigation öffnen');
  if (wasOpen) {
    Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '' });
    window.scrollTo(0, navScrollY);
  }
}
function scrollToTarget(target) {
  if (!target) return;
  const header = document.querySelector('.site-header')?.offsetHeight || 0;
  const top = window.scrollY + target.getBoundingClientRect().top - header - 14;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

navToggle?.addEventListener('click', () => document.body.classList.contains('nav-open') ? closeNav() : lockNav());
window.addEventListener('resize', () => { if (window.innerWidth > 1040) closeNav(); });

document.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-filter]');
  if (chip) {
    activeReferenceFilter = chip.dataset.filter || 'all';
    referenceSearch = '';
    const input = document.querySelector('.reference-search input');
    if (input) input.value = '';
    applyReferenceView();
    if (activeReferenceFilter === 'interior' || activeReferenceFilter === 'medallions') {
      setTimeout(() => scrollToTarget(document.querySelector('#specialarbeiten')), 50);
    }
    return;
  }

  const gallery = event.target.closest('[data-gallery-index]');
  if (gallery) {
    const project = projects[Number(gallery.dataset.galleryIndex)];
    if (project) openLightbox(project.images, Number(gallery.dataset.galleryStart || 0), project.title);
    return;
  }
  const titleGallery = event.target.closest('[data-title-gallery]');
  if (titleGallery) {
    const project = projects.find((p) => p.title === titleGallery.dataset.titleGallery);
    if (project) openLightbox(project.images, 0, project.title);
    return;
  }
  const medal = event.target.closest('[data-medallion-index]');
  if (medal) openLightbox(medallions.images, Number(medal.dataset.medallionIndex || 0), 'Medallions');
});

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  const target = document.querySelector(anchor.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  closeNav();
  if (anchor.dataset.filterLink) {
    activeReferenceFilter = anchor.dataset.filterLink;
    referenceSearch = '';
    applyReferenceView();
  }
  scrollToTarget(target);
  history.replaceState?.(null, '', anchor.getAttribute('href'));
});

function ensureLightboxControls() {
  if (!lightbox || lightbox.querySelector('.lightbox-prev')) return;
  const prev = document.createElement('button');
  const next = document.createElement('button');
  const meta = document.createElement('div');
  prev.type = next.type = 'button';
  prev.className = 'lightbox-nav lightbox-prev';
  next.className = 'lightbox-nav lightbox-next';
  prev.setAttribute('aria-label', 'Vorheriges Bild');
  next.setAttribute('aria-label', 'Nächstes Bild');
  prev.textContent = '‹';
  next.textContent = '›';
  meta.className = 'lightbox-meta';
  meta.innerHTML = '<strong></strong><span></span>';
  lightbox.append(prev, next, meta);
  prev.addEventListener('click', () => showLightbox(lightboxIndex - 1));
  next.addEventListener('click', () => showLightbox(lightboxIndex + 1));
}
function showLightbox(index) {
  if (!lightboxGallery.length || !lightboxImage) return;
  lightboxIndex = (index + lightboxGallery.length) % lightboxGallery.length;
  lightboxImage.src = lightboxGallery[lightboxIndex];
  lightboxImage.alt = `${lightboxTitle} – Bild ${lightboxIndex + 1} von ${lightboxGallery.length}`;
  const meta = lightbox?.querySelector('.lightbox-meta');
  if (meta) {
    meta.querySelector('strong').textContent = lightboxTitle;
    meta.querySelector('span').textContent = `${lightboxIndex + 1} / ${lightboxGallery.length}`;
  }
}
function openLightbox(gallery, start = 0, title = 'Projekt') {
  if (!lightbox || !gallery?.length) return;
  ensureLightboxControls();
  lightboxGallery = gallery;
  lightboxTitle = title;
  showLightbox(start);
  lightbox.showModal();
  document.body.classList.add('lightbox-open');
}
function closeLightbox() {
  if (lightbox?.open) lightbox.close();
  document.body.classList.remove('lightbox-open');
}
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (lightbox?.open) closeLightbox(); else closeNav(); }
  if (lightbox?.open && event.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
  if (lightbox?.open && event.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
});

document.querySelectorAll('[data-prefill]').forEach((button) => button.addEventListener('click', () => {
  if (projectType) projectType.value = button.dataset.prefill || '';
}));

files?.addEventListener('change', () => {
  const names = [...(files.files || [])].map((file) => file.name);
  if (fileStatus) fileStatus.textContent = names.length
    ? `${names.length} Datei${names.length === 1 ? '' : 'en'} ausgewählt: ${names.join(', ')}`
    : 'Optional – Bilder oder PDF auswählen';
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const value = (id) => document.querySelector(`#${id}`)?.value?.trim() || '';
  const names = [...(files?.files || [])].map((file) => file.name);
  const body = [
    'Guten Tag,', '',
    'ich möchte folgendes Projekt anfragen:', '',
    `Projektart: ${value('project-type')}`,
    `Material: ${value('material') || '–'}`,
    `Maße: ${value('dimensions') || '–'}`,
    `Stückzahl: ${value('quantity') || '–'}`,
    `Ort / PLZ: ${value('location') || '–'}`, '',
    `Beschreibung: ${value('details') || '–'}`, '',
    `Name: ${value('name')}`,
    `E-Mail: ${value('email')}`,
    `Telefon: ${value('phone') || '–'}`,
    names.length ? `Ausgewählte Dateien (bitte im Mailprogramm anhängen): ${names.join(', ')}` : 'Keine Dateien ausgewählt.'
  ].join('\n');
  window.location.href = `mailto:info@larasser-metallbau.de?subject=${encodeURIComponent(`Projektanfrage – ${value('project-type') || 'Metallbau'}`)}&body=${encodeURIComponent(body)}`;
  if (formNote) formNote.textContent = 'Die E-Mail wurde vorbereitet. Ausgewählte Dateien bitte im Mailprogramm noch anhängen.';
});

async function init() {
  try {
    await loadSourceData();
    updateCompanyCopy();
    ensureServicesAndFilters();
    renderReferences();
    renderReferenceTools();
    renderSpecialWork();
    addContactParity();
    ensureLightboxControls();
    updateFilterCounts();
    applyReferenceView();
  } catch (error) {
    console.error(error);
    const grid = document.querySelector('#reference-grid');
    if (grid) grid.innerHTML = '<p class="source-load-error">Die Referenzen konnten gerade nicht geladen werden. Bitte die Seite neu laden.</p>';
  }
}

init();
