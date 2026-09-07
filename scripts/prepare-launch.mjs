import fs from 'node:fs/promises';

async function read(path) { return fs.readFile(path, 'utf8'); }
async function write(path, content) { await fs.writeFile(path, content, 'utf8'); }

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Launch prep could not find ${label}`);
  return source.replace(search, replacement);
}

let html = await read('index.html');

html = replaceRequired(
  html,
  '<meta name="description" content="Unverbindliche Demo für einen modernisierten Webauftritt von Metallbau Larasser in Grafing bei München." />',
  '<meta name="description" content="Larasser Metallbau in Grafing bei München: Treppen, Geländer, Balkone, Tore, Zäune, Stahlbau, Metallgestaltung, Reparatur, Lohnbiegen und Lohnschneiden." />',
  'demo meta description',
);
html = replaceRequired(html, '<title>Metallbau Larasser – Demo</title>', '<title>Metallbau Larasser | Metallbau & Metallgestaltung in Grafing</title>', 'demo title');

if (!html.includes('<!-- launch-seo:start -->')) {
  const marker = '  <title>Metallbau Larasser | Metallbau & Metallgestaltung in Grafing</title>\n';
  const seo = `  <!-- launch-seo:start -->\n  <link rel="canonical" href="https://www.larasser-metallbau.de/" />\n  <meta property="og:type" content="website" />\n  <meta property="og:locale" content="de_DE" />\n  <meta property="og:site_name" content="Larasser Metallbau" />\n  <meta property="og:title" content="Metallbau Larasser | Metallbau & Metallgestaltung in Grafing" />\n  <meta property="og:description" content="Treppen, Geländer, Balkone, Tore, Zäune, Stahlbau, Metallgestaltung, Reparatur sowie Lohnbiegen und Lohnschneiden aus Grafing bei München." />\n  <meta property="og:url" content="https://www.larasser-metallbau.de/" />\n  <meta name="twitter:card" content="summary" />\n  <script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "LocalBusiness",\n    "name": "Larasser Metallbau",\n    "url": "https://www.larasser-metallbau.de/",\n    "telephone": "+49 8092 709151",\n    "email": "info@larasser-metallbau.de",\n    "address": {\n      "@type": "PostalAddress",\n      "streetAddress": "Ebersberger Straße 10 A",\n      "postalCode": "85567",\n      "addressLocality": "Grafing bei München",\n      "addressCountry": "DE"\n    },\n    "openingHoursSpecification": [\n      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"], "opens": "07:30", "closes": "16:00" },\n      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "07:30", "closes": "12:00" }\n    ]\n  }\n  </script>\n  <!-- launch-seo:end -->\n`;
  html = html.replace(marker, marker + seo);
}

html = replaceRequired(
  html,
  '<form class="project-form" id="project-form">',
  '<form class="project-form" id="project-form" method="post" enctype="multipart/form-data" data-form-endpoint="">\n          <div class="form-hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off" /></div>',
  'project form tag',
);
html = replaceRequired(
  html,
  'Ich möchte die Anfrage als E-Mail vorbereiten. In dieser Demo werden keine Formulardaten gespeichert.',
  'Ich habe die Datenschutzerklärung zur Kenntnis genommen und stimme zu, dass meine Angaben zur Bearbeitung der Anfrage übermittelt werden.',
  'demo consent copy',
);
html = replaceRequired(html, '>Anfrage als E-Mail vorbereiten</button>', '>Projektanfrage senden</button>', 'demo form button');
html = replaceRequired(
  html,
  'Demo-Funktion: Es wird noch kein Formular an einen Server gesendet.',
  'Der direkte Formularversand wird beim finalen Hosting aktiviert. Bis dahin öffnet die Demo eine vorbereitete E-Mail.',
  'demo form note',
);

if (!html.includes('<script src="launch-config.js"></script>')) {
  html = html.replace(
    '  <script src="source-complete.js"></script>\n',
    '  <script src="source-complete.js"></script>\n  <script src="launch-config.js"></script>\n  <script src="launch-ready.js"></script>\n',
  );
}

await write('index.html', html);

let css = await read('source-complete.css');
if (!css.includes('/* launch-ready form states */')) {
  css += `\n\n/* launch-ready form states */\n.form-hp { position: absolute !important; left: -10000px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }\n.project-form[aria-busy="true"] { opacity: .86; }\n.project-form .submit-button:disabled { cursor: wait; opacity: .7; }\n.form-note[data-state="success"] { font-weight: 700; }\n.form-note[data-state="error"] { font-weight: 700; }\n`;
  await write('source-complete.css', css);
}

let qa = await read('.github/browser-qa.mjs');
qa = qa.replace(
  "assert(await page.title() === 'Metallbau Larasser – Demo', `${profile.name}: unexpected title`);",
  "assert(await page.title() === 'Metallbau Larasser | Metallbau & Metallgestaltung in Grafing', `${profile.name}: unexpected title`);",
);
await write('.github/browser-qa.mjs', qa);

console.log('Launch preparation applied. noindex/nofollow intentionally remains in index.html.');
