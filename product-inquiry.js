(() => {
  'use strict';
  const form = document.querySelector('[data-part-inquiry]');
  if (!form) return;

  const message = form.querySelector('input[name="message"]');
  const summary = form.querySelector('[data-config-summary]');
  const files = form.querySelector('#files');
  const uploadStatus = form.querySelector('[data-upload-status]');

  const val = (name) => form.elements.namedItem(name)?.value?.trim?.() || '';
  const shapeLabel = () => form.querySelector('input[name="part-shape"]:checked')?.value || 'nicht gewählt';

  const buildSummary = () => {
    const lines = [
      `Bauteil: ${shapeLabel()}`,
      `Stückzahl: ${val('quantity') || '—'}`,
      `Material: ${val('material') || '—'}`,
      `Stärke: ${val('thickness') ? `${val('thickness')} mm` : '—'}`,
      `Länge: ${val('length') ? `${val('length')} mm` : '—'}`,
      `Breite: ${val('width') ? `${val('width')} mm` : '—'}`,
      `Bohrungen: ${val('holes') || '—'}`,
      `Bohrungsdurchmesser: ${val('hole-diameter') ? `${val('hole-diameter')} mm` : '—'}`,
      `Bearbeitung: ${val('process') || '—'}`,
      `Hinweise: ${val('notes') || '—'}`,
    ];
    const text = lines.join('\n');
    if (summary) summary.textContent = text;
    if (message) message.value = `Bauteilanfrage Lohnfertigung\n\n${text}`;
  };

  form.addEventListener('input', buildSummary);
  form.addEventListener('change', buildSummary);
  form.addEventListener('submit', buildSummary, { capture: true });

  files?.addEventListener('change', () => {
    const selected = [...files.files];
    if (!uploadStatus) return;
    if (!selected.length) {
      uploadStatus.textContent = 'Noch keine Datei ausgewählt.';
      return;
    }
    uploadStatus.textContent = selected.length === 1
      ? selected[0].name
      : `${selected.length} Dateien ausgewählt`;
  });

  buildSummary();
})();
