import fs from 'node:fs/promises';

const pages = {
  start: 'https://www.larasser-metallbau.de/',
  treppen: 'https://www.larasser-metallbau.de/referenzen/treppen-and-gelander/',
  tore: 'https://www.larasser-metallbau.de/referenzen/tore-and-zaune/',
  balkone: 'https://www.larasser-metallbau.de/referenzen/balkone-and-terrassen/',
  stahlbau: 'https://www.larasser-metallbau.de/referenzen/carports-dacher-and-stahlbau/',
  interior: 'https://www.larasser-metallbau.de/referenzen/interior/',
  medallions: 'https://www.larasser-metallbau.de/referenzen/medallions/',
  lohnfertigung: 'https://www.larasser-metallbau.de/referenzen/lohnbiegen-and-lohnschneiden/',
  ueberUns: 'https://www.larasser-metallbau.de/uber-uns/',
  kontakt: 'https://www.larasser-metallbau.de/kontakt/',
  impressum: 'https://www.larasser-metallbau.de/impressum/',
};

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&#8211;', '–')
    .replaceAll('&#8212;', '—');
}

function normalizeUrl(raw, base) {
  if (!raw || raw.startsWith('data:')) return null;
  try {
    return new URL(decodeHtml(raw.trim()), base).href;
  } catch {
    return null;
  }
}

function extractImages(html, base) {
  const urls = new Set();
  const attrs = [...html.matchAll(/<(?:img|source)\b[^>]*(?:src|data-src|srcset|data-srcset)=["']([^"']+)["'][^>]*>/gi)];
  for (const match of attrs) {
    const value = match[1];
    for (const candidate of value.split(',')) {
      const raw = candidate.trim().split(/\s+/)[0];
      const url = normalizeUrl(raw, base);
      if (url && url.includes('larasser-metallbau.de') && /\.(?:jpe?g|png|webp)(?:\?|$)/i.test(url)) urls.add(url);
    }
  }

  for (const match of html.matchAll(/https?:\\?\/\\?\/[^"'\s<>]+?\.(?:jpe?g|png|webp)(?:\?[^"'\s<>]*)?/gi)) {
    const raw = match[0].replaceAll('\\/', '/');
    const url = normalizeUrl(raw, base);
    if (url && url.includes('larasser-metallbau.de')) urls.add(url);
  }
  return [...urls];
}

function textSnapshot(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>|<\/h[1-6]>|<\/li>|<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\r/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n')
      .trim()
  );
}

const result = {};
for (const [key, url] of Object.entries(pages)) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; LarasserDemoSourceAudit/1.0; +https://github.com/ys2mm422yb-max/metallbau-la)',
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  const html = await response.text();
  result[key] = {
    url,
    status: response.status,
    finalUrl: response.url,
    imageUrls: extractImages(html, response.url),
    text: textSnapshot(html),
  };
  console.log(`SOURCE ${key}: status=${response.status} images=${result[key].imageUrls.length}`);
  for (const image of result[key].imageUrls) console.log(`IMAGE ${key} ${image}`);
}

await fs.writeFile('source-crawl.json', JSON.stringify(result, null, 2));
console.log('WROTE source-crawl.json');
