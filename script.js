const visualFixes = document.createElement('link');
visualFixes.rel = 'stylesheet';
visualFixes.href = 'visual-fixes.css';
document.head.appendChild(visualFixes);

const navToggle = document.querySelector('.nav-toggle');
const form = document.querySelector('#project-form');
const files = document.querySelector('#files');
const fileStatus = document.querySelector('#file-status');
const formNote = document.querySelector('#form-note');
const projectType = document.querySelector('#project-type');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

let navScrollY = 0;
let lightboxGallery = [];
let lightboxIndex = 0;
let lightboxTitle = '';
let activeReferenceFilter = 'all';
let referenceSearch = '';

const verifiedGalleryExtras = {
  'Geschmiedete Gartengeländer': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/3e83caed-00c9-419c-8f04-ec6e697d1611/l0%2Ct1%2Cw2000%2Ch1268/image-797x505.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/25ccc72e-a00c-48f8-9647-f3f6af641d10/l0%2Ct77%2Cw2000%2Ch1923/image-768x738.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/4f84f0fb-937e-4435-b99e-b36db92cc7c4/l0%2Ct0%2Cw1228%2Ch2000/image-768x1251.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/6502627b-0c90-4190-88a7-c32eec264f20/l88%2Ct0%2Cw1228%2Ch2000/image-768x1251.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/615f5711-ef7b-4ba9-a3a8-00af8eb73d78/l171%2Ct224%2Cw1066%2Ch1559/image-768x1123.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/51bc9d1f-1a28-4a36-94ad-dc3208129dcd/l0%2Ct355%2Cw1333%2Ch1059/image-768x610.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/f035f1b9-60d9-406f-9e6a-002a195f0489/l0%2Ct175%2Cw1333%2Ch1059/image-768x610.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9cde86f3-86a6-437a-a69c-dd96fca85fd0/l48%2Ct0%2Cw1404%2Ch2000/image-768x1094.jpg',
  ],
  'Doppelwangige Stahltreppe': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/83055293-6894-4ec5-b03a-7e4225d0b652/l0%2Ct810%2Cw892%2Ch1190/image-768x1025.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9d9f4f65-4c8e-40ed-a6a1-dd68a861d0e3/l0%2Ct29%2Cw1500%2Ch1942/image-768x994.png',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/311c0e14-dfef-44c6-acd2-858c3b530836/l0%2Ct29%2Cw1500%2Ch1942/image-768x994.png',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/bb864f2d-2344-4236-8fdb-e388543a30b6/l0%2Ct29%2Cw1500%2Ch1942/image-768x994.png',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/8c37b1f2-0fc3-4730-b21d-9c5b3d62dd61/l0%2Ct28%2Cw1124%2Ch1944/image-768x1328.jpg',
  ],
  'Klassisches Schmiedetor': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/41725da4-8bfb-4a32-979b-1621fad411ba/l607%2Ct0%2Cw1000%2Ch1333/image-768x1024.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/98fe32a2-e139-480e-9ec1-9ab279d2d290/l0%2Ct2%2Cw2000%2Ch1059/image-1366x723.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/756f3701-d1cb-485f-a644-1b2ac5710eb4/l0%2Ct111%2Cw1333%2Ch1777/image-768x1024.jpg',
  ],
  'Gartenzaunanlage & Tore': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/757cb438-5881-45fd-aadb-c311cfe6656c/l411%2Ct0%2Cw1000%2Ch1333/image-768x1024.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/cd4d32f4-58fe-40ff-a754-9b7f9147446c/l0%2Ct15%2Cw2000%2Ch842/image-1366x575.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9ae60a31-268c-4ee7-9b37-825cca7f683d/l4%2Ct0%2Cw1866%2Ch2000/image-768x823.jpg',
  ],
  'Gartentor & Zaun': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/95f5d7ea-eb9a-4aae-a598-db10cd4dea92/l0%2Ct104%2Cw2000%2Ch842/image-1366x575.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/d8814c25-f540-461a-a98f-aae2c5bdae40/l207%2Ct247%2Cw1586%2Ch1006/image-797x506.jpg',
  ],
  'Moderne Toranlage': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9224d5b2-1f50-4c3f-b528-7152c4c05d58/l0%2Ct2%2Cw1123%2Ch1497/image-768x1024.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/ea085cc2-2713-418e-bc94-f294910367e3/l629%2Ct198%2Cw1029%2Ch1103/image-768x823.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/ce6aaa08-7fdf-47dd-849c-0a8b8a7c0aa1/l0%2Ct117%2Cw2000%2Ch1266/image-768x486.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/82fca918-2907-47ca-b992-94292f12b72c/l0%2Ct0%2Cw1125%2Ch1752/image-768x1196.jpg',
  ],
  'Geschmiedetes Gartentor': [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/db9976aa-bcc4-44d8-a8d0-c64b56c771a3/l42%2Ct0%2Cw1926%2Ch1124/image-1366x797.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9b72f311-a87c-4447-9cf7-c158375eb59f/l0%2Ct0%2Cw1125%2Ch1454/image-768x993.jpg',
  ],
};

const interiorProjects = [
  {
    year: '2023',
    title: 'Schachtisch',
    description: 'Ein Tisch mit verborgenem Schachbrett: Das mittig liegende Holzelement kann entnommen werden, die geschmiedeten Figuren sind passend integriert. Auf der bestehenden Website als mit dem Meisterpreis ausgezeichnet beschrieben.',
  },
  {
    year: '2023',
    title: 'Feuerschale',
    description: 'Das Projekt „Feuerschale“ war Thema in der Meisterschule, die Martin Larasser 2022/23 besuchte. Die bestehende Seite beschreibt solche Objekte als eng mit den Kunden geplant und umgesetzt.',
  },
  {
    year: '2021',
    title: 'Stehleuchte',
    description: 'Als Gesellenstück von Martin Larasser gefertigt und auf der bestehenden Website als mit dem ersten Preis der „Guten Form“ im Handwerk ausgezeichnet beschrieben.',
  },
  {
    year: '2004',
    title: 'Sisyphus',
    description: 'Aus alten Kutschenachsen und einem lokalen Findling geschmiedet. Der Sisyphus steht laut bestehender Seite vor dem Heimatmuseum in Grafing bei München.',
  },
  {
    year: '2002',
    title: 'Badeinrichtung',
    description: 'Höhenverstellbarer Spiegel mit Gasdruckdämpfern, eingefasst mit Edelstahl und einer kleinen Holzablage; dazu eine Edelstahl-Unterkonstruktion für das Waschbecken.',
  },
  {
    year: '2020',
    title: 'Grafinger Bär',
    description: 'Aus Bronze gefertigter Bär mit eingemeißelten Konturen, gefärbt und gewachst.',
  },
  {
    year: '2020',
    title: 'Schale – The Space Between Us',
    description: 'Zwei gebogene Metallflächen – konkav und konvex – berühren sich in einem Punkt. Die Arbeit entstand laut bestehender Seite im Rahmen von Martin Larassers Ausbildung in der Schmiede Peter Michael Reich.',
  },
  {
    year: '',
    title: 'Gastronomieeinrichtung',
    description: 'Individuelle Metalllösungen für betriebliche Kunden; auf der bestehenden Seite unter anderem mit maßgefertigten Gläserhaltern für einen Gastronomiebetrieb gezeigt.',
  },
  {
    year: '2018',
    title: 'Holzlege',
    description: 'Holzlege und Bodenblech aus verzundertem Stahl – abgestimmt auf Form und Material des Ofens.',
  },
];

const medallionsDescription = 'Die Medaillons werden laut bestehender Larasser-Seite aus Bronze gefertigt und mit handgemachten Stempeln unter glühender Hitze geprägt. Sie können vergoldet, gefärbt, verzinnt oder unbehandelt bleiben; auch Kombinationen sind möglich. Motive und Stempel werden auf Wunsch individuell gestaltet.';

function addServiceAndFilterCoverage() {
  const services = document.querySelector('.services');
  if (services) {
    const lohnService = [...services.querySelectorAll('.service-card')].find((card) => card.getAttribute('href') === '#lohnfertigung');
    if (lohnService) {
      const index = lohnService.querySelector('.service-index');
      if (index) index.textContent = '07';
    }

    const interiorCard = [...services.querySelectorAll('.service-card')].find((card) => card.dataset.filterLink === 'interior');
    if (interiorCard) {
      interiorCard.querySelector('h3').textContent = 'Interior & Metallgestaltung';
      interiorCard.querySelector('p').textContent = 'Möbel, Leuchten, Objekte, Gastronomie- und Wohnraumlösungen – individuell geplant und gefertigt.';
    }

    if (!services.querySelector('[data-source-service="medallions"]')) {
      const card = document.createElement('a');
      card.className = 'service-card service-card-source';
      card.dataset.sourceService = 'medallions';
      card.dataset.filterLink = 'medallions';
      card.href = '#referenzen';
      card.innerHTML = '<span class="service-index">06</span><h3>Medallions</h3><p>Individuell geprägte Bronze-Medaillons mit handgemachten Stempeln und unterschiedlichen Oberflächen.</p><span class="service-arrow">↗</span>';
      services.insertBefore(card, lohnService || null);
    }
  }

  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const filterDefinitions = [
      ['interior', 'Interior'],
      ['medallions', 'Medallions'],
    ];
    filterDefinitions.forEach(([value, label]) => {
      if (filterBar.querySelector(`[data-filter="${value}"]`)) return;
      const button = document.createElement('button');
      button.className = 'filter-chip';
      button.type = 'button';
      button.dataset.filter = value;
      button.textContent = label;
      filterBar.appendChild(button);
    });
  }

  if (projectType && ![...projectType.options].some((option) => option.text === 'Medallions')) {
    const option = document.createElement('option');
    option.text = 'Medallions';
    option.value = 'Medallions';
    const lohnOption = [...projectType.options].find((item) => item.text === 'Lohnbiegen & Lohnschneiden');
    projectType.insertBefore(option, lohnOption || null);
  }
}

function addArchiveCoverage() {
  const archiveList = document.querySelector('.archive-list');
  if (!archiveList) return;

  const knownTitles = new Set([...archiveList.querySelectorAll('strong')].map((node) => node.textContent.trim()));
  const verifiedProjects = [
    ['treppen', '2015', 'Geschwungene Stahltreppe', 'Treppen & Geländer'],
    ['treppen', '2016', 'Treppengeländer im Handwerkerhaus', 'Treppen & Geländer'],
    ['tore', '2019', 'Friedhofstor & Zaunanlage', 'Tore & Zäune'],
    ['balkone', '2022', 'Terrasse mit Geländer', 'Balkone & Terrassen'],
    ['balkone', '2016', 'Geschmiedeter Balkon', 'Balkone & Terrassen'],
    ...interiorProjects.map((item) => ['interior', item.year || '—', item.title, 'Interior & Metallgestaltung']),
    ['medallions', '—', 'Individuelle Bronze-Medaillons', 'Medallions'],
  ];

  verifiedProjects.forEach(([category, year, title, label]) => {
    if (knownTitles.has(title)) return;
    const item = document.createElement('div');
    item.dataset.category = category;
    item.dataset.search = `${year} ${title} ${label}`.toLowerCase();
    item.innerHTML = `<span>${year}</span><strong>${title}</strong><small>${label}</small>`;
    archiveList.appendChild(item);
  });

  const panel = document.querySelector('.archive-panel');
  if (panel && !panel.querySelector('.archive-toggle')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'archive-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span>Vollständiges Projektarchiv anzeigen</span><strong></strong>';
    panel.appendChild(toggle);
    toggle.addEventListener('click', () => {
      const expanded = panel.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.querySelector('span').textContent = expanded ? 'Projektarchiv einklappen' : 'Vollständiges Projektarchiv anzeigen';
    });
  }
}

function addSpecialWorkShowcase() {
  if (document.querySelector('#specialarbeiten')) return;
  const fabrication = document.querySelector('#lohnfertigung');
  if (!fabrication) return;

  const section = document.createElement('section');
  section.id = 'specialarbeiten';
  section.className = 'special-work section-light';

  const projectMarkup = interiorProjects.map((project) => `
    <article class="special-project" data-category="interior" data-search="${`${project.year} ${project.title} ${project.description}`.toLowerCase().replace(/"/g, '&quot;')}">
      <span>${project.year || 'Interior'}</span>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    </article>
  `).join('');

  section.innerHTML = `
    <div class="content-width special-head">
      <div>
        <p class="section-label">Interior & Metallgestaltung</p>
        <h2>Mehr als Geländer, Tore und Stahlbau.</h2>
      </div>
      <p>Die bestehende Larasser-Seite zeigt einen deutlich größeren gestalterischen Bereich. In enger Zusammenarbeit werden individuelle Wünsche entworfen, geplant, gefertigt und montiert – für Wohnraum, Garten und betriebliche Einrichtungen.</p>
    </div>

    <div class="content-width special-layout">
      <div class="special-column special-column-main">
        <div class="special-column-head">
          <span>Ausgewählte Interior-Arbeiten</span>
          <a href="https://www.larasser-metallbau.de/referenzen/interior/" target="_blank" rel="noopener">Originalgalerie öffnen ↗</a>
        </div>
        <div class="special-project-grid">${projectMarkup}</div>
      </div>

      <aside class="medallions-panel" data-category="medallions" data-search="medallions bronze stempel vergoldet gefärbt verzinnt individuell">
        <span class="medallions-kicker">Medallions</span>
        <h3>Individuell geprägt. Von der Form bis zur Oberfläche.</h3>
        <p>${medallionsDescription}</p>
        <div class="medallion-finish-list" aria-label="Oberflächen und Gestaltungsmöglichkeiten">
          <span>Bronze</span><span>vergoldet</span><span>gefärbt</span><span>verzinnt</span><span>unbehandelt</span><span>individuelle Stempel</span>
        </div>
        <a class="button button-dark" href="https://www.larasser-metallbau.de/referenzen/medallions/" target="_blank" rel="noopener">Medaillon-Galerie öffnen ↗</a>
      </aside>
    </div>
  `;

  fabrication.insertAdjacentElement('beforebegin', section);

  const nav = document.querySelector('.site-nav');
  if (nav && !nav.querySelector('a[href="#specialarbeiten"]')) {
    const link = document.createElement('a');
    link.href = '#specialarbeiten';
    link.textContent = 'Interior';
    const fabricationLink = nav.querySelector('a[href="#lohnfertigung"]');
    nav.insertBefore(link, fabricationLink || nav.querySelector('.nav-cta'));
  }
}

function addReferenceTools() {
  const projectsTop = document.querySelector('.projects-top');
  const filterBar = projectsTop?.querySelector('.filter-bar');
  if (!projectsTop || !filterBar || projectsTop.querySelector('.reference-tools')) return;

  const tools = document.createElement('div');
  tools.className = 'reference-tools';
  tools.innerHTML = `
    <label class="reference-search">
      <span class="sr-only">Referenzen durchsuchen</span>
      <input type="search" inputmode="search" autocomplete="off" placeholder="Projekt suchen …" aria-label="Referenzen durchsuchen" />
    </label>
    <span class="reference-count" aria-live="polite"></span>
  `;
  filterBar.insertAdjacentElement('beforebegin', tools);

  const input = tools.querySelector('input');
  input.addEventListener('input', () => {
    referenceSearch = input.value.trim().toLowerCase();
    applyReferenceView();
  });
}

function addContactAndLegalCoverage() {
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

  const inquiryCopy = document.querySelector('.inquiry-copy');
  if (inquiryCopy && !inquiryCopy.querySelector('.direct-contact-row')) {
    const direct = document.createElement('div');
    direct.className = 'direct-contact-row';
    direct.innerHTML = `
      <a href="tel:+491715248966"><span>Stephan Larasser · mobil</span><strong>+49 171 5248966</strong></a>
      <a href="tel:+491773248147"><span>Martin Larasser · mobil</span><strong>+49 177 3248147</strong></a>
    `;
    const meta = inquiryCopy.querySelector('.contact-meta');
    if (meta) meta.insertAdjacentElement('afterend', direct);
    else inquiryCopy.appendChild(direct);
  }

  const footerContact = document.querySelector('.footer-grid > div:nth-child(3)');
  if (footerContact && !footerContact.querySelector('.fax-line')) {
    const fax = document.createElement('p');
    fax.className = 'fax-line';
    fax.textContent = 'Fax +49 8092 709152';
    footerContact.appendChild(fax);
  }

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

function addOriginalGalleryLinks() {
  const panel = document.querySelector('.archive-panel');
  if (!panel || panel.querySelector('.source-category-links')) return;
  const sourceLinks = document.createElement('div');
  sourceLinks.className = 'source-category-links';
  sourceLinks.innerHTML = `
    <span>Direkt zu den umfangreichen Bildgalerien der bestehenden Website:</span>
    <div>
      <a href="https://www.larasser-metallbau.de/referenzen/interior/" target="_blank" rel="noopener">Interior ↗</a>
      <a href="https://www.larasser-metallbau.de/referenzen/medallions/" target="_blank" rel="noopener">Medallions ↗</a>
    </div>
  `;
  panel.appendChild(sourceLinks);
}

function addVerifiedSourceCoverage() {
  addServiceAndFilterCoverage();
  addArchiveCoverage();
  addSpecialWorkShowcase();
  addReferenceTools();
  addContactAndLegalCoverage();
  addOriginalGalleryLinks();
}

addVerifiedSourceCoverage();

function getNavLinks() {
  return [...document.querySelectorAll('.site-nav a')];
}

function getFilterChips() {
  return [...document.querySelectorAll('[data-filter]')];
}

function getFilterableItems() {
  return [
    ...document.querySelectorAll('.reference-card[data-category]'),
    ...document.querySelectorAll('.archive-list [data-category]'),
  ];
}

function itemSearchText(item) {
  return `${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
}

function updateFilterCounts() {
  const items = getFilterableItems();
  getFilterChips().forEach((chip) => {
    const filter = chip.dataset.filter || 'all';
    const count = items.filter((item) => filter === 'all' || item.dataset.category === filter).length;
    let countNode = chip.querySelector('small');
    if (!countNode) {
      countNode = document.createElement('small');
      chip.appendChild(countNode);
    }
    countNode.textContent = String(count);
  });
}

function applyReferenceView() {
  let visibleCount = 0;
  getFilterChips().forEach((chip) => {
    const active = chip.dataset.filter === activeReferenceFilter;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });

  getFilterableItems().forEach((item) => {
    const categoryMatch = activeReferenceFilter === 'all' || item.dataset.category === activeReferenceFilter;
    const searchMatch = !referenceSearch || itemSearchText(item).includes(referenceSearch);
    const visible = categoryMatch && searchMatch;
    item.classList.toggle('is-hidden', !visible);
    if (visible) visibleCount += 1;
  });

  const countNode = document.querySelector('.reference-count');
  if (countNode) {
    countNode.textContent = `${visibleCount} ${visibleCount === 1 ? 'Projekt' : 'Projekte'}`;
  }
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

getNavLinks().forEach((link) => link.addEventListener('click', closeNav));

window.addEventListener('resize', () => {
  if (window.innerWidth > 1040) closeNav();
});

updateFilterCounts();
getFilterChips().forEach((chip) => {
  chip.setAttribute('aria-pressed', String(chip.classList.contains('is-active')));
  chip.addEventListener('click', () => {
    activeReferenceFilter = chip.dataset.filter || 'all';
    applyReferenceView();
  });
});
applyReferenceView();

document.querySelectorAll('[data-filter-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const filter = link.dataset.filterLink;
    const hasMatches = getFilterableItems().some((item) => item.dataset.category === filter);
    if (filter && hasMatches) {
      activeReferenceFilter = filter;
      referenceSearch = '';
      const searchInput = document.querySelector('.reference-search input');
      if (searchInput) searchInput.value = '';
      applyReferenceView();
    }
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

function ensureLightboxControls() {
  if (!lightbox || lightbox.querySelector('.lightbox-prev')) return;
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'lightbox-nav lightbox-prev';
  prev.setAttribute('aria-label', 'Vorheriges Projektbild');
  prev.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'lightbox-nav lightbox-next';
  next.setAttribute('aria-label', 'Nächstes Projektbild');
  next.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const meta = document.createElement('div');
  meta.className = 'lightbox-meta';
  meta.innerHTML = '<strong></strong><span></span>';

  lightbox.append(prev, next, meta);
  prev.addEventListener('click', () => stepLightbox(-1));
  next.addEventListener('click', () => stepLightbox(1));
}

function renderLightboxImage() {
  if (!lightbox || !lightboxImage || !lightboxGallery.length) return;
  const item = lightboxGallery[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = `${lightboxTitle} – Bild ${lightboxIndex + 1} von ${lightboxGallery.length}`;

  const prev = lightbox.querySelector('.lightbox-prev');
  const next = lightbox.querySelector('.lightbox-next');
  const metaTitle = lightbox.querySelector('.lightbox-meta strong');
  const metaCount = lightbox.querySelector('.lightbox-meta span');
  const hasMultiple = lightboxGallery.length > 1;
  if (prev) prev.hidden = !hasMultiple;
  if (next) next.hidden = !hasMultiple;
  if (metaTitle) metaTitle.textContent = lightboxTitle;
  if (metaCount) metaCount.textContent = `${lightboxIndex + 1} / ${lightboxGallery.length}`;
}

function stepLightbox(delta) {
  if (lightboxGallery.length < 2) return;
  lightboxIndex = (lightboxIndex + delta + lightboxGallery.length) % lightboxGallery.length;
  renderLightboxImage();
}

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
  document.body.classList.remove('lightbox-open');
}

ensureLightboxControls();

document.querySelectorAll('[data-lightbox-src]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    const card = button.closest('.reference-card');
    lightboxTitle = card?.querySelector('h3')?.textContent?.trim() || button.dataset.lightboxAlt || 'Projektbild';
    const primary = button.dataset.lightboxSrc || '';
    const extras = verifiedGalleryExtras[lightboxTitle] || [];
    const sources = [primary, ...extras].filter(Boolean);
    lightboxGallery = [...new Set(sources)].map((src) => ({ src }));
    lightboxIndex = 0;
    renderLightboxImage();
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
    if (fileStatus) fileStatus.textContent = 'Optional – Bilder oder PDF auswählen';
    return;
  }

  if (fileStatus) {
    fileStatus.textContent = selected.length === 1
      ? selected[0].name
      : `${selected.length} Dateien ausgewählt`;
  }
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
  if (lightbox?.open && event.key === 'ArrowLeft') stepLightbox(-1);
  if (lightbox?.open && event.key === 'ArrowRight') stepLightbox(1);
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
  if (formNote) formNote.textContent = 'E-Mail wird vorbereitet. Ausgewählte Dateien bitte im Mailprogramm manuell anhängen.';
  window.location.href = mailto;
});