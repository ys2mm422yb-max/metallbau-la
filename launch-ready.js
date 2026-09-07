(() => {
  const form = document.querySelector('#project-form');
  if (!form) return;

  const note = document.querySelector('#form-note');
  const submit = form.querySelector('button[type="submit"]');
  const files = form.querySelector('#files');
  const config = window.LARASSER_CONFIG || {};
  const endpoint = String(form.dataset.formEndpoint || config.formEndpoint || '').trim();

  const hp = form.querySelector('input[name="website"]');
  const MAX_FILES = 8;
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
  const allowedExtensions = /\.(?:jpe?g|png|webp|heic|heif|pdf)$/i;

  function setNote(message, state = '') {
    if (!note) return;
    note.textContent = message;
    note.dataset.state = state;
  }

  function validateFiles() {
    const selected = [...(files?.files || [])];
    if (selected.length > MAX_FILES) {
      return `Bitte maximal ${MAX_FILES} Dateien auswählen.`;
    }
    let total = 0;
    for (const file of selected) {
      total += file.size || 0;
      const allowedType = file.type === 'application/pdf' || file.type.startsWith('image/') || allowedExtensions.test(file.name || '');
      if (!allowedType) return `Dateityp nicht unterstützt: ${file.name}`;
      if ((file.size || 0) > MAX_FILE_BYTES) return `${file.name} ist größer als 10 MB.`;
    }
    if (total > MAX_TOTAL_BYTES) return 'Die ausgewählten Dateien sind zusammen größer als 25 MB.';
    return '';
  }

  files?.addEventListener('change', () => {
    const error = validateFiles();
    if (error) {
      files.setCustomValidity(error);
      setNote(error, 'error');
    } else {
      files.setCustomValidity('');
      if (endpoint) setNote('Fotos, Skizzen und PDFs können direkt mitgesendet werden.', 'ready');
    }
  });

  form.addEventListener('submit', async (event) => {
    const fileError = validateFiles();
    files?.setCustomValidity(fileError);
    if (fileError || !form.reportValidity()) {
      event.preventDefault();
      if (fileError) setNote(fileError, 'error');
      return;
    }

    // Honeypot: bots usually fill hidden website fields. Do not disclose detection.
    if (hp?.value) {
      event.preventDefault();
      event.stopImmediatePropagation();
      form.reset();
      setNote('Vielen Dank. Ihre Anfrage wurde übermittelt.', 'success');
      return;
    }

    // Until the final host/form service is selected, keep the existing mailto fallback.
    // This makes the complete form testable without putting any secret into GitHub.
    if (!endpoint) {
      setNote('Der direkte Versand wird beim finalen Hosting aktiviert. Die Demo bereitet solange eine E-Mail vor.', 'demo');
      return;
    }

    let endpointUrl;
    try {
      endpointUrl = new URL(endpoint, window.location.href);
      if (!['https:', 'http:'].includes(endpointUrl.protocol)) throw new Error('unsupported protocol');
    } catch {
      event.preventDefault();
      event.stopImmediatePropagation();
      setNote('Der Formularversand ist noch nicht korrekt konfiguriert. Bitte nutzen Sie E-Mail oder Telefon.', 'error');
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    submit?.setAttribute('disabled', '');
    form.setAttribute('aria-busy', 'true');
    setNote('Anfrage wird gesendet …', 'pending');

    const payload = new FormData(form);
    payload.append('_page', window.location.href);
    payload.append('_recipient', config.recipient || 'info@larasser-metallbau.de');
    payload.append('_submitted_at', new Date().toISOString());

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      const fileStatus = document.querySelector('#file-status');
      if (fileStatus) fileStatus.textContent = 'Optional – Bilder oder PDF auswählen';
      setNote('Vielen Dank. Ihre Projektanfrage wurde erfolgreich gesendet.', 'success');
    } catch (error) {
      console.error('Form submission failed', error);
      setNote('Die Anfrage konnte gerade nicht gesendet werden. Bitte nutzen Sie E-Mail oder Telefon.', 'error');
    } finally {
      submit?.removeAttribute('disabled');
      form.removeAttribute('aria-busy');
    }
  }, true);
})();
