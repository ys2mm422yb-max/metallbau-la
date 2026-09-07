(() => {
  const projects = [
    ['treppen','Treppen & Geländer','2025','Geschmiedete Geländer für den Garten','Aus Stahl geschmiedete Geländer für Stufen im Garten und den Treppenaufgang zur Haustüre. Handläufe und Pfosten sind gelocht und mit Fünfpass vernietet; Schnecken sind konisch ausgeschmiedet und trompetenförmig angestaucht.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/1290164a-69a7-4723-85e3-a4f5b95c0b9a/l25%2Ct0%2Cw1284%2Ch2000/image-768x1196.jpg'],
    ['treppen','Treppen & Geländer','2024','Doppelwangige Stahltreppe','Diese Treppe fügt sich mit ihrer klaren Linienführung und den transparenten Elementen unaufdringlich in den Raum ein. Schlicht gestaltet und funktional – passend zur modernen Umgebung.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9cde86f3-86a6-437a-a69c-dd96fca85fd0/l48%2Ct0%2Cw1404%2Ch2000/image-768x1094.jpg'],
    ['treppen','Treppen & Geländer','2024','Schlichtes Harfengeländer','Treppengeländer, das Sicherheit gewährleistet und sich unauffällig dem Treppenhaus unterordnet. Hier mit Senkschrauben befestigt und weiß lackiert.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/8c37b1f2-0fc3-4730-b21d-9c5b3d62dd61/l0%2Ct28%2Cw1124%2Ch1944/image-768x1328.jpg'],
    ['treppen','Treppen & Geländer','2015','Geschwungene Stahltreppe','','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/69a57670-f97d-473c-ba85-460a919394e9/l288%2Ct0%2Cw1059%2Ch1949/image-768x1413.jpg'],
    ['treppen','Treppen & Geländer','2023','Außentreppe mit Natursteinstufen','Kombination von Stahltreppe mit Natursteinstufen und Edelstahlhandlauf.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/51f1b9b0-bfae-4c76-92d4-650856f5ca92/l180%2Ct0%2Cw999%2Ch1837/image-768x1412.jpg'],
    ['treppen','Treppen & Geländer','2022','Treppengeländer im Treppenauge','Im Treppenauge befestigte Pfosten halten die geschweißten Geländerfelder.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/f147e899-0746-483e-8019-17e851f18b93/l139%2Ct0%2Cw731%2Ch1344/image.jpg'],
    ['treppen','Treppen & Geländer','2020','Stahltreppe mit Messinghandlauf','Treppenaufgang zum Garten, rutschsicher durch Gitterroststufen, mit normgerechtem Geländer und Bronze-Handlauf.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/bb224c74-568f-4d06-97b8-90445221ef06/l80%2Ct0%2Cw540%2Ch935/image.jpg'],
    ['treppen','Treppen & Geländer','2016','Treppengeländer im Handwerkerhaus','Geschmiedetes Treppengeländer aus Stahl mit Holzhandlauf. In traditioneller Schmiedetechnik ausgeführt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/30022b9f-13ce-4999-abd1-73b6217b5cb3/l16%2Ct0%2Cw1234%2Ch2000/image-768x1245.jpg'],
    ['treppen','Treppen & Geländer','2025','Absturzsicherung im schmalen Treppenauge','Als Absturzsicherung wird hier ein beleuchteter Glaskasten verwendet, der sich durch die Stockwerke hindurch fortsetzt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/76a9fb36-4126-4581-b8e4-c586edfa5f29/l0%2Ct117%2Cw948%2Ch1602/image-768x1298.jpg'],

    ['tore','Tore & Zäune','2019','Klassisches Schmiedetor','Robustes, handgefertigtes Schmiedeeisentor mit gelochter Gitterstruktur und vergoldetem Ornament. Zur leichteren Bedienung werden elektrische Torantriebe eingesetzt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/3bed4ea6-c90d-43df-a9d1-a831f6ac927b/l0%2Ct0%2Cw1333%2Ch1723/image-768x993.jpg'],
    ['tore','Tore & Zäune','2025','Gartenzaunanlage / Tore','Schlichte Stahlrahmen, verzinkt und lackiert, kombiniert mit geschlagener Holzfüllung. Passend zu Haus und Gartenanlage individuell entworfen, gebaut und montiert.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/756f3701-d1cb-485f-a644-1b2ac5710eb4/l0%2Ct111%2Cw1333%2Ch1777/image-768x1024.jpg'],
    ['tore','Tore & Zäune','2022','Gartentor & Zaun','Geschweißter Gartenzaun mit Briefkästen und aufgesetzten Blättchen als Stababschluss. Das dazugehörige Gartentor ist im gleichen Stil gestaltet und an verstellbaren Bändern befestigt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9ae60a31-268c-4ee7-9b37-825cca7f683d/l4%2Ct0%2Cw1866%2Ch2000/image-768x823.jpg'],
    ['tore','Tore & Zäune','2023','Moderne Toranlage','Blickdichte Tor- und Zaunanlage mit Lichtschranken und passendem Mülltonnenhaus.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/d8814c25-f540-461a-a98f-aae2c5bdae40/l207%2Ct247%2Cw1586%2Ch1006/image-797x506.jpg'],
    ['tore','Tore & Zäune','2021','Geschmiedetes Gartentor','Restauration am bestehenden Gartentor.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/82fca918-2907-47ca-b992-94292f12b72c/l0%2Ct0%2Cw1125%2Ch1752/image-768x1196.jpg'],
    ['tore','Tore & Zäune','2019','Friedhofstor & Zaunanlage','Tor und Zaun aus Stahl, geschmiedet, gelocht und vernietet. Die Gestaltung arbeitet mit zu Blättern geschmiedeten Stabenden und eingerollten Schnecken.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/9b72f311-a87c-4447-9cf7-c158375eb59f/l0%2Ct0%2Cw1125%2Ch1454/image-768x993.jpg'],

    ['balkone','Balkone & Terrassen','2024','Balkon mit Solarkraftwerk','Balkonkraftwerke werden zunehmend beliebter. Gut geplante Systeme verbinden Effizienz mit einer unauffälligen, funktionalen Gestaltung.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/069d9392-7577-416c-a0a9-afbdd750b64e/l0%2Ct31%2Cw1333%2Ch1899/image-768x1094.jpg'],
    ['balkone','Balkone & Terrassen','2024','Edelstahl-Balkongeländer mit Solarkraftwerk','Hier wird ein schlicht gehaltenes Edelstahlgeländer mit Solarpanelen verkleidet.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/f3de6b18-d947-4615-9b06-246b9b3b2fda/l0%2Ct30%2Cw1500%2Ch1939/image-768x993.jpg'],
    ['balkone','Balkone & Terrassen','2022','Glas & Edelstahl','Planung, Fertigung und Montage von Glas und Metall erfolgen aus einer Hand.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/2ca684e1-964f-45a3-a759-9f4ddf1537d1/l0%2Ct53%2Cw2000%2Ch1038/image-1252x650.jpg'],
    ['balkone','Balkone & Terrassen','2020','Stahlbalkon','Auf Säulen steht die Stahlunterkonstruktion stabil und ästhetisch.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/98eeaf30-f6a3-4631-bd7c-7b312230da27/l564%2Ct0%2Cw547%2Ch947/image.jpg'],
    ['balkone','Balkone & Terrassen','2022','Terrasse mit Geländer','Mit Holz belegte Terrasse kombiniert mit Edelstahlgeländer, dessen Handlauf durch den Doppelstab gehalten wird. Als Füllung werden Drahtseile verwendet. Zwei Treppen schließen an die Terrasse an.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/966d7ae7-6c42-4368-9c94-09f49b6dbdb8/l0%2Ct367%2Cw2000%2Ch950/image-1366x649.jpg'],
    ['balkone','Balkone & Terrassen','2016','Geschmiedeter Balkon','Mit bewährten Schmiedetechniken gefertigter Balkon. Ornamente, Ober- und Untergurte sind traditionell vernietet.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/11d70633-6edf-4bff-ac09-1b12a1e8dc1c/l212%2Ct34%2Cw637%2Ch683/image.jpg'],
    ['balkone','Balkone & Terrassen','2002','Mehrstöckiger Stahlbalkon','Mehrstöckige Balkonanlagen aus verzinktem Stahl. Träger und Pfosten sind verschraubt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/bd661aba-24cb-4c8c-9bc6-0380d2260910/l0%2Ct22%2Cw900%2Ch1557/image-768x1329.jpg'],

    ['stahlbau','Carports, Dächer & Stahlbau','2023','Fahrradhaus','Durch die am Rahmen verschraubten Latten werden die Werkstoffe Stahl und Holz sinnvoll und elegant kombiniert. Der Stahlrahmen ist zum Korrosionsschutz verzinkt und lackiert.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/bdc6b352-b98e-4107-9f13-8054eb24141a/l280%2Ct0%2Cw665%2Ch947/image.jpg'],
    ['stahlbau','Carports, Dächer & Stahlbau','2021','Pergola aus Stahlprofilen','Diese Pergola bietet eine helle, luftige Überdachung für die Terrasse. Stahl und Glas fügen sich schlicht und unaufdringlich ins Gesamtbild ein – langlebig und passend zum Garten.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/64840aaa-ae8f-4a81-9fbb-dbee6ae59edf/l95%2Ct0%2Cw1404%2Ch2000/image-768x1094.jpg'],
    ['stahlbau','Carports, Dächer & Stahlbau','2024','Pyramidendach mit Staubdeckenkonstruktion','Maßgefertigte Stahl-Glas-Konstruktion nach statischen Anforderungen, mit integrierter Staubdecke und Rauchabzugsklappe. Die entkoppelte Trägerkonstruktion ermöglicht eine unabhängige Wartungsebene mit Gitterroststeg.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/767cb596-81a9-49a6-b748-b37128f76e87/l0%2Ct0%2Cw1404%2Ch2000/image-768x1094.jpg'],
    ['stahlbau','Carports, Dächer & Stahlbau','2024','Carport mit Trapezblechdach','Trapezblech ermöglicht eine kosteneffiziente Überdachung. Transparente Kunststoffelemente sorgen für Lichtdurchlässigkeit. Die Konstruktion wird aus gängigen Stahlträgern verschraubt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/cac00610-9325-48ab-ad36-ec319e49556f/l237%2Ct0%2Cw1193%2Ch1700/image-768x1094.jpg'],
    ['stahlbau','Carports, Dächer & Stahlbau','2024','Carport für drei Fahrzeuge','Der Carport bietet Platz für drei Autos, ohne störende Säulen zwischen den Stellplätzen, sowie zusätzlichen Raum für Fahrräder oder Gartengeräte. Das Grundgerüst bilden Stahlträger; das Dach ist mit Trapezblech gedeckt, zwischen den Säulen bilden Rahmen und Holzbretter eine schützende Füllung.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/0e08b7bf-2176-4801-a503-a7af7b21c325/l520%2Ct0%2Cw485%2Ch691/image.jpg'],

    ['interior','Interior & Metallgestaltung','2023','Schachtisch','Ein Tisch, in dem ein verborgenes Schachbrett durch ein mittig liegendes Holzelement ersetzt werden kann – die Figuren sind geschmiedet und passend integriert. Ausgezeichnet mit dem Meisterpreis.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/ef9095ec-e6d6-4813-bfb9-fa4927e1518e/l0%2Ct213%2Cw1333%2Ch1575/image-768x907.jpg'],
    ['interior','Interior & Metallgestaltung','2023','Feuerschale','Das Projekt „Feuerschale“ war Thema in der Meisterschule, die Martin Larasser 2022/23 besuchte. Objekte wie diese werden in engster Zusammenarbeit mit den Kunden geplant und umgesetzt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/0e55e4e4-1581-43fc-a923-bd558fc0215a/l62%2Ct0%2Cw1777%2Ch1333/image-768x576.jpg'],
    ['interior','Interior & Metallgestaltung','2021','Stehleuchte','Als Gesellenstück von Martin Larasser gefertigt und mit dem ersten Preis der „Guten Form“ im Handwerk ausgezeichnet. Entstanden in enger Zusammenarbeit mit Philipp Schumann und Peter Michael Reich.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/693d1d6e-723e-482b-afa7-a3116b4ccba3/l75%2Ct41%2Cw554%2Ch958/image.jpg'],
    ['interior','Interior & Metallgestaltung','2018','Holzlege','Holzlege und Bodenblech aus verzundertem Stahl – abgestimmt auf Form und Material des Ofens.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/2c78b8bf-d27d-4bcc-a093-a15c748eb527/l106%2Ct98%2Cw1287%2Ch1834/image-768x1094.jpg'],
    ['interior','Interior & Metallgestaltung','2022','Gastronomieeinrichtung','Auch für betriebliche Kunden, wie hier einen Gastronomiebetrieb, werden individuelle und passende Lösungen umgesetzt.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/c4cd3414-44c0-497c-8c41-70fd1b0066d3/l0%2Ct228%2Cw1500%2Ch1772/image-768x907.jpg'],
    ['interior','Interior & Metallgestaltung','2020','Schale „The Space Between Us“','Zwei gebogene Metallflächen – konkav und konvex – berühren sich in einem Punkt. Dazwischen entsteht ein spannungsvoller Raum, der Nähe und Distanz sichtbar macht. Die Schale entstand im Rahmen von Martin Larassers Ausbildung in der Schmiede Peter Michael Reich.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/daeb7f28-c56b-45a0-aca9-e4991ae1712a/l711%2Ct76%2Cw785%2Ch807/image-768x790.jpg'],
    ['interior','Interior & Metallgestaltung','2020','Grafinger Bär','Aus Bronze gefertigter Bär mit eingemeißelten Konturen, gefärbt und gewachst.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/544ea316-9250-41da-a2af-e36c0adc5a80/l0%2Ct103%2Cw1285%2Ch1801/image-768x1076.jpg'],
    ['interior','Interior & Metallgestaltung','2002','Badeinrichtung','Mit Gasdruckdämpfern höhenverstellbarer Spiegel, eingefasst mit Edelstahl und einer kleinen Ablagefläche aus Holz. Dazu eine Edelstahl-Unterkonstruktion für das Waschbecken.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/e6d5acc0-57b1-4cfa-940a-1a6faf84398e/l0%2Ct41%2Cw837%2Ch1303/image-768x1196.jpg'],
    ['interior','Interior & Metallgestaltung','2004','Sisyphus','Aus alten Kutschenachsen und einem lokalen Findling geschmiedet. Der Sisyphus steht vor dem Heimatmuseum in Grafing bei München.','https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/5f7f860a-3237-4a8d-9cad-2e81d1f390d5/l0%2Ct66%2Cw1333%2Ch1867/image-768x1076.jpg'],
  ];

  const medallionImages = [
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/fed3ff42-a233-4579-80c0-6bf92e2939e3/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/8a81f80a-7460-444f-a5d5-1a8291d1af44/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/31187d62-2f59-4612-9600-7f54264b048c/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/a2aa6e8e-31f1-4ec7-8173-95722b861961/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/993e38d4-17fe-477c-89dc-5c830b298dad/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/6a28e003-bd12-43d8-a984-4de786c7078a/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/0c7b2068-5167-42e0-90dd-53d325a5b880/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/d7700195-c5b4-446a-ba33-cfc8b0897f62/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/faf18d21-8b77-40ad-9930-e6cd882d1361/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/830ce2e2-357e-4794-ae96-fba2372e0ee2/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/bd1e7426-0c92-4f86-82ab-28bc0854afdf/image-384x384.jpg',
    'https://www.larasser-metallbau.de/wp-content/uploads/go-x/u/7f8acf8e-8b1e-47d5-a360-7b10a617545e/image-384x384.jpg'
  ];

  const contextCopy = {
    all: 'Treppen und Geländer, Tore und Zäune, Balkone und Terrassen, Stahlbau, Interior sowie Medaillons – mit realisierten Arbeiten aus dem öffentlichen Larasser-Projektarchiv.',
    treppen: 'Ob außen oder innen, Bestand oder Neubau, Metall, Holz oder Naturstein: Treppengeländer werden integriert oder komplette Treppen individuell gestaltet.',
    tore: 'Zäune und Tore aus Glas, Holz, Stahl, Bronze oder Edelstahl – passend zu Garten und Anwesen und in enger Zusammenarbeit mit den Auftraggebern.',
    balkone: 'Vom Entwurf von Stahlbalkonen über Geländer passend zum Bestand und Ausbesserungen bis zur Integration von Balkonkraftwerken.',
    stahlbau: 'Carports, Dächer und Stahlbau – von Stahl-Holz-Konstruktionen bis zu maßgefertigten Stahl-Glas-Lösungen nach statischen Anforderungen.',
    interior: 'In enger Zusammenarbeit werden individuelle Wünsche entworfen, geplant, gefertigt und montiert – für Wohnraum, Garten und betriebliche Einrichtungen.',
    medallions: 'Medaillons aus Bronze, mit handgemachten Stempeln unter glühender Hitze geprägt. Möglich sind vergoldete, gefärbte, verzinnte, unbehandelte oder kombinierte Oberflächen sowie individuelle Motive und Stempel.'
  };

  const grid = document.querySelector('#reference-grid');
  if (!grid) return;

  const escapeHTML = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const cardMarkup = projects.map(([category, label, year, title, description, image]) => `
    <article class="reference-card source-reference-card" data-category="${category}" data-search="${escapeHTML(`${year} ${label} ${title} ${description}`.toLowerCase())}">
      <button class="reference-image" type="button" data-lightbox-src="${image}" data-lightbox-alt="${escapeHTML(title)}">
        <img src="${image}" alt="${escapeHTML(title)}" loading="lazy" decoding="async" />
      </button>
      <div class="reference-copy">
        <span>${escapeHTML(label)} · ${escapeHTML(year)}</span>
        <h3>${escapeHTML(title)}</h3>
        ${description ? `<p>${escapeHTML(description)}</p>` : ''}
      </div>
    </article>`).join('');

  const medallionThumbs = medallionImages.map((src, index) => `
    <button type="button" class="medallion-thumb" data-lightbox-src="${src}" data-lightbox-alt="Medaillon – Motiv ${index + 1}">
      <img src="${src}" alt="Bronze-Medaillon – Motiv ${index + 1}" loading="lazy" decoding="async" />
    </button>`).join('');

  const medallionCard = `
    <article class="reference-card source-reference-card source-medallion-card" data-category="medallions" data-search="medallions medaillons bronze stempel vergoldet gefärbt verzinnt unbehandelt individuell">
      <button class="reference-image" type="button" data-lightbox-src="${medallionImages[0]}" data-lightbox-alt="Individuelle Bronze-Medaillons">
        <img src="${medallionImages[0]}" alt="Individuelle Bronze-Medaillons" loading="lazy" decoding="async" />
      </button>
      <div class="reference-copy">
        <span>Medallions</span>
        <h3>Individuelle Bronze-Medaillons</h3>
        <p>Die Medaillons werden aus Bronze gefertigt und mit handgemachten Stempeln unter glühender Hitze geprägt. Sie können vergoldet, gefärbt, verzinnt oder unbehandelt bleiben – auch Kombinationen sind möglich. Auf Wunsch werden Medaillons und Stempel individuell gestaltet. Auch eigene Ideen können als personalisierter Stempel umgesetzt und geprägt werden.</p>
      </div>
      <div class="medallion-gallery" aria-label="Auswahl realisierter Medaillons">${medallionThumbs}</div>
    </article>`;

  grid.innerHTML = cardMarkup + medallionCard;

  const heading = document.querySelector('#referenzen .section-head h2');
  if (heading) heading.textContent = 'Referenzen aus Metallbau und Metallgestaltung.';
  const intro = document.querySelector('#referenzen .section-intro');
  if (intro) intro.textContent = contextCopy.all;

  const projectsTop = document.querySelector('#referenzen .projects-top');
  if (projectsTop && !document.querySelector('#reference-context')) {
    const context = document.createElement('p');
    context.id = 'reference-context';
    context.className = 'reference-context';
    context.textContent = contextCopy.all;
    projectsTop.appendChild(context);
  }

  const setContext = (filter) => {
    const context = document.querySelector('#reference-context');
    if (context) context.textContent = contextCopy[filter] || contextCopy.all;
  };

  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => setContext(chip.dataset.filter || 'all'));
    const filter = chip.dataset.filter || 'all';
    const count = filter === 'all'
      ? projects.length + 1
      : projects.filter((project) => project[0] === filter).length + (filter === 'medallions' ? 1 : 0);
    let countNode = chip.querySelector('small');
    if (!countNode) {
      countNode = document.createElement('small');
      chip.appendChild(countNode);
    }
    countNode.textContent = String(count);
  });

  document.querySelectorAll('[data-filter-link]').forEach((link) => {
    link.addEventListener('click', () => setContext(link.dataset.filterLink || 'all'));
  });

  const special = document.querySelector('#specialarbeiten');
  if (special) {
    const title = special.querySelector('.special-head h2');
    const text = special.querySelector('.special-head > p');
    if (title) title.textContent = 'Individuelle Metallgestaltung für Wohnraum, Garten und Betrieb.';
    if (text) text.textContent = 'Neben klassischem Metallbau entstehen bei Larasser auch Möbel, Leuchten, Objekte und individuelle Einrichtungen. Die Projekte reichen vom ausgezeichneten Schachtisch über die Feuerschale und Stehleuchte bis zu Gastronomieeinrichtung und Arbeiten aus Bronze.';
    special.querySelectorAll('.special-project').forEach((card) => {
      const project = projects.find((item) => item[0] === 'interior' && item[3] === card.querySelector('h3')?.textContent?.replace('Schale – ', 'Schale '));
      if (project && !card.querySelector('img')) {
        const img = document.createElement('img');
        img.src = project[5];
        img.alt = project[3];
        img.loading = 'lazy';
        img.decoding = 'async';
        card.prepend(img);
      }
    });
  }

  const archiveHead = document.querySelector('.archive-head');
  if (archiveHead) {
    const label = archiveHead.querySelector('.section-label');
    const text = archiveHead.querySelector('p:not(.section-label)');
    if (label) label.textContent = 'Projektübersicht';
    if (text) text.textContent = 'Weitere dokumentierte Arbeiten nach Bereich und Jahr.';
  }

  const aboutCopy = document.querySelector('#betrieb .about-copy > p');
  if (aboutCopy) {
    aboutCopy.textContent = 'Larasser Metallbau ist seit 1996 in Grafing bei München tätig. Der Meisterbetrieb arbeitet in den Bereichen Schlosserarbeiten, Metall-, Stahl- und Glasbau, Edelstahl, Reparatur und Service, Blechverarbeitung sowie zertifizierte Schweißarbeiten. Das Team besteht aus zwei Meistern und einem Gesellen.';
  }

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lightbox-src]');
    if (!button || !lightbox || !lightboxImage) return;
    event.preventDefault();
    event.stopPropagation();
    const src = button.dataset.lightboxSrc;
    if (!src) return;
    lightboxImage.src = src;
    lightboxImage.alt = button.dataset.lightboxAlt || 'Projektbild';
    const title = lightbox.querySelector('.lightbox-meta strong');
    const count = lightbox.querySelector('.lightbox-meta span');
    if (title) title.textContent = button.dataset.lightboxAlt || 'Projektbild';
    if (count) count.textContent = '';
    lightbox.querySelectorAll('.lightbox-nav').forEach((control) => { control.hidden = true; });
    document.body.classList.add('lightbox-open');
    if (!lightbox.open) lightbox.showModal();
  });
})();