import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'assets', 'source');
const runtimeFiles = [
  'index.html',
  'styles.css',
  'source-complete.css',
  'visual-fixes.css',
  'script.js',
  'source-complete.js',
  'app-v4.js',
  'refs-balkone.js',
  'refs-tore.js',
  'refs-treppen.js',
  'data/treppen.json',
  'data/tore.json',
  'data/balkone.json',
  'data/stahlbau.json',
  'data/interior.json',
  'data/medallions.json',
];

const sourcePrefix = 'https://www.larasser-metallbau.de/wp-content/uploads/';
const urlPattern = /https:\/\/www\.larasser-metallbau\.de\/wp-content\/uploads\/[^\s"'<>)}]+/g;

function sha(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 20);
}

function extensionFor(url, contentType = '') {
  const pathname = new URL(url).pathname.toLowerCase();
  const match = pathname.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i);
  if (match) return match[1].toLowerCase().replace('jpeg', 'jpg');
  const type = contentType.toLowerCase();
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  if (type.includes('avif')) return 'avif';
  return 'jpg';
}

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const contents = new Map();
const allUrls = new Set();
for (const file of runtimeFiles) {
  const absolute = path.join(ROOT, file);
  let text;
  try { text = await fs.readFile(absolute, 'utf8'); } catch { continue; }
  contents.set(file, text);
  for (const match of text.matchAll(urlPattern)) allUrls.add(match[0]);
}

if (allUrls.size < 180) {
  throw new Error(`Expected at least 180 public Larasser image URLs before localization, found ${allUrls.size}. Aborting instead of producing a partial migration.`);
}

console.log(`Localizing ${allUrls.size} unique public image URLs …`);

const manifest = {};
const urls = [...allUrls];
let nextIndex = 0;

async function worker() {
  while (true) {
    const index = nextIndex++;
    if (index >= urls.length) return;
    const url = urls[index];
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Larasser-website-migration/1.0' },
    });
    if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error(`Unexpected content type ${contentType || '(none)'}: ${url}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1024) throw new Error(`Suspiciously small image (${buffer.length} bytes): ${url}`);
    const ext = extensionFor(url, contentType);
    const rel = `assets/source/${sha(url)}.${ext}`;
    await fs.writeFile(path.join(ROOT, rel), buffer);
    manifest[url] = { path: rel, bytes: buffer.length, contentType };
    if ((index + 1) % 20 === 0 || index + 1 === urls.length) console.log(`${index + 1}/${urls.length}`);
  }
}

await Promise.all(Array.from({ length: Math.min(10, urls.length) }, () => worker()));

for (const [file, original] of contents.entries()) {
  let text = original;
  for (const [url, meta] of Object.entries(manifest)) text = text.split(url).join(meta.path);
  await fs.writeFile(path.join(ROOT, file), text, 'utf8');
}

await fs.writeFile(
  path.join(OUTPUT_DIR, 'manifest.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: sourcePrefix, count: Object.keys(manifest).length, files: manifest }, null, 2)}\n`,
  'utf8',
);

let remaining = 0;
for (const file of runtimeFiles) {
  try {
    const text = await fs.readFile(path.join(ROOT, file), 'utf8');
    remaining += (text.match(urlPattern) || []).length;
  } catch {}
}
if (remaining !== 0) throw new Error(`${remaining} remote runtime image references remain after localization.`);

console.log(`Localized ${Object.keys(manifest).length} images. Remaining remote runtime image references: 0.`);
