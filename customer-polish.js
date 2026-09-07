(() => {
  const normalize = (value = '') => value
    .toLowerCase()
    .replace(/[„“”"'’]/g, '')
    .replace(/[–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sourceCards = [...document.querySelectorAll('#reference-grid .source-reference-card[data-category="interior"]')];
  const sourceByTitle = new Map(sourceCards.map((card) => [
    normalize(card.querySelector('h3')?.textContent || ''),
    card,
  ]));

  document.querySelectorAll('#specialarbeiten .special-project').forEach((card) => {
    const title = normalize(card.querySelector('h3')?.textContent || '');
    let source = sourceByTitle.get(title);

    if (!source && title.includes('space between us')) {
      source = sourceCards.find((item) => normalize(item.querySelector('h3')?.textContent || '').includes('space between us'));
    }

    const sourceText = source?.querySelector('.reference-copy p')?.textContent?.trim();
    const paragraph = card.querySelector('p');
    if (paragraph && sourceText) paragraph.textContent = sourceText;
  });

  document.querySelectorAll('#specialarbeiten a[href*="/referenzen/interior/"]').forEach((link) => {
    link.textContent = 'Weitere Interior-Bilder ansehen ↗';
  });

  document.querySelectorAll('#specialarbeiten a[href*="/referenzen/medallions/"]').forEach((link) => {
    link.textContent = 'Weitere Medaillon-Bilder ansehen ↗';
  });

  const context = document.querySelector('#reference-context');
  if (context && context.textContent.includes('öffentlichen Larasser-Projektarchiv')) {
    context.textContent = 'Treppen und Geländer, Tore und Zäune, Balkone und Terrassen, Stahlbau, Interior sowie Medaillons – mit realisierten Arbeiten aus unterschiedlichen Jahren.';
  }
})();