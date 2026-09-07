import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const outDir = 'artifacts/browser-qa';
await fs.mkdir(outDir, { recursive: true });

const profiles = [
  { name: 'desktop-chromium', engine: chromium, context: { viewport: { width: 1440, height: 1000 } } },
  { name: 'android-chromium', engine: chromium, context: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36' } },
  { name: 'iphone-webkit', engine: webkit, context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' } },
];

const expected = {
  treppen: 9,
  tore: 6,
  balkone: 7,
  stahlbau: 5,
  interior: 9,
  medallions: 1,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureImageLoaded(locator, profile, category) {
  await locator.scrollIntoViewIfNeeded();
  const image = locator.locator('.reference-image img').first();
  await image.waitFor({ state: 'visible' });
  await image.evaluate(async (img) => {
    if (!img.complete) {
      await new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 7000);
      });
    }
    try { await img.decode(); } catch {}
  });
  const health = await image.evaluate((img) => ({ complete: img.complete, width: img.naturalWidth, src: img.currentSrc || img.src }));
  assert(health.complete && health.width > 0, `${profile}: ${category} has a broken lead image: ${health.src}`);
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('#reference-grid .source-reference-card').length >= 37);

  const allCount = await page.locator('#reference-grid .source-reference-card').count();
  assert(allCount === 37, `${profile.name}: expected 37 source-complete reference cards, got ${allCount}`);

  for (const [category, count] of Object.entries(expected)) {
    const chip = page.locator(`[data-filter="${category}"]`).first();
    assert(await chip.count() === 1, `${profile.name}: missing ${category} filter`);
    await chip.click();
    await page.waitForTimeout(120);

    const visible = page.locator(`#reference-grid .source-reference-card[data-category="${category}"]:visible`);
    const visibleCount = await visible.count();
    assert(visibleCount === count, `${profile.name}: ${category} filter expected ${count} photo projects, got ${visibleCount}`);

    await ensureImageLoaded(visible.first(), profile.name, category);

    if (category === 'balkone' || category === 'stahlbau' || category === 'medallions') {
      await visible.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      await page.screenshot({ path: `${outDir}/${profile.name}-${category}.png`, fullPage: false });
    }
  }

  await page.locator('[data-filter="all"]').first().click();
  const weirdVisibleCopy = await page.evaluate(() => {
    const text = ['referenzen', 'specialarbeiten']
      .map((id) => document.getElementById(id)?.innerText || '')
      .join('\n');
    return [
      'Mehr echte Projekte. Weniger Werbetext.',
      'Diese Demo macht daraus',
      'auf der bestehenden Website',
      'auf der bestehenden Seite',
      'bestehende Larasser-Seite',
    ].filter((needle) => text.includes(needle));
  });
  assert(weirdVisibleCopy.length === 0, `${profile.name}: internal migration wording is still visible: ${weirdVisibleCopy.join(', ')}`);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(horizontalOverflow <= 1, `${profile.name}: source-complete UI has horizontal overflow (${horizontalOverflow}px)`);
  assert(errors.length === 0, `${profile.name}: page errors: ${errors.join(' | ')}`);

  await browser.close();
}

console.log('Source-complete QA passed on desktop, Android and iPhone/WebKit.');