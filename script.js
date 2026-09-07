const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const form = document.querySelector('#project-form');
const files = document.querySelector('#files');
const fileStatus = document.querySelector('#file-status');
const formNote = document.querySelector('#form-note');
const projectType = document.querySelector('#project-type');

function closeNav() {
  document.body.classList.remove('nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Navigation öffnen');
}

navToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Navigation schließen' : 'Navigation öffnen');
});

navLinks.forEach((link) => link.addEventListener('click', closeNav));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNav();
});

files?.addEventListener('change', () => {
  const selected = [...files.files];
  if (!selected.length) {
    fileStatus.textContent = 'Optional – Bilder oder PDF auswählen';
    return;
  }

  fileStatus.textContent = selected.length === 1
    ? selected[0].name
    : `${selected.length} Dateien ausgewählt: ${selected.map((file) => file.name).join(', ')}`;
});

document.querySelectorAll('[data-prefill]').forEach((link) => {
  link.addEventListener('click', () => {
    const value = link.dataset.prefill;
    const option = [...projectType.options].find((item) => item.text === value);
    if (option) projectType.value = value;
  });
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

  formNote.textContent = 'E-Mail wird vorbereitet. Ausgewählte Dateien bitte im Mailprogramm anhängen.';
  window.location.href = mailto;
});
