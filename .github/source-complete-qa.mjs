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

async function ensureImageLoaded(image, profile, label) {
  await image.scrollIntoViewIfNeeded();
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
  const health = await image.evaluate((img) => ({ complete: img.complete, width: img.naturalWidth, height: img.naturalHeight, src: img.currentSrc || img.src }));
  assert(health.complete && health.width > 0 && health.height > 0, `${profile}: ${label} has a broken image: ${health.src}`);
}

async function assertLeadContained(card, profile, label) {
  const state = await card.evaluate((element) => {
    const frame = element.querySelector('.reference-image');
    const image = frame?.querySelector('img');
    if (!frame || !image) return null;
    const f = frame.getBoundingClientRect();
    const i = image.getBoundingClientRect();
    return { frame: [f.left, f.top, f.right, f.bottom], image: [i.left, i.top, i.right, i.bottom] };
  });
  assert(state, `${profile}: ${label} is missing its image frame`);
  const [fl, ft, fr, fb] = state.frame;
  const [il, it, ir, ib] = state.image;
  const tolerance = 1.5;
  assert(il >= fl - tolerance && ir <= fr + tolerance && it >= ft - tolerance && ib <= fb + tolerance, `${profile}: ${label} lead image escapes its frame`);
}

async function verifyAllSourceImageUrls(page, profile) {
  const urls = await page.evaluate(async () => {
    const files = ['data/treppen.json', 'data/tore.json', 'data/balkone.json', 'data/stahlbau.json', 'data/interior.json', 'data/medallions.json'];
    const payloads = await Promise.all(files.map(async (file) => (await fetch(file, { cache: 'no-store' })).json()));
    return [...new Set(payloads.flatMap((payload) => payload.category === 'medallions'
      ? payload.images || []
      : (payload.projects || []).flatMap((project) => project.images || [])))];
  });

  const broken = await page.evaluate(async (imageUrls) => {
    const failures = [];
    const load = (src) => new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => resolve({ src, ok: false, reason: 'timeout' }), 9000);
      img.onload = () => { clearTimeout(timer); resolve({ src, ok: img.naturalWidth > 0, reason: 'load' }); };
      img.onerror = () => { clearTimeout(timer); resolve({ src, ok: false, reason: 'error' }); };
      img.src = src;
    });
    for (let i = 0; i < imageUrls.length; i += 10) {
      const results = await Promise.all(imageUrls.slice(i, i + 10).map(load));
      failures.push(...results.filter((result) => !result.ok));
    }
    return failures;
  }, urls);

  assert(broken.length === 0, `${profile}: ${broken.length} source gallery images failed to load: ${JSON.stringify(broken.slice(0, 5))}`);
  console.log(`${profile}: verified ${urls.length} source gallery image URLs`);
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('#reference-grid .source-project-card').length === 36 && document.querySelectorAll('#specialarbeiten .medallion-item').length >= 40);

  const projectCount = await page.locator('#reference-grid .source-project-card').count();
  const medallionGroupCount = await page.locator('#specialarbeiten .medallions-section').count();
  assert(projectCount + medallionGroupCount === 37, `${profile.name}: expected 37 source-complete reference groups, got ${projectCount + medallionGroupCount}`);

  for (const [category, count] of Object.entries(expected)) {
    const chip = page.locator(`[data-filter="${category}"]`).first();
    assert(await chip.count() === 1, `${profile.name}: missing ${category} filter`);
    const badge = await chip.locator('small').textContent();
    assert(Number(badge) === count, `${profile.name}: ${category} filter badge expected ${count}, got ${badge}`);
  }
  const allBadge = await page.locator('[data-filter="all"] small').textContent();
  assert(Number(allBadge) === 37, `${profile.name}: all filter badge expected 37, got ${allBadge}`);

  for (const category of ['treppen', 'tore', 'balkone', 'stahlbau', 'interior']) {
    const count = expected[category];
    await page.locator(`[data-filter="${category}"]`).first().click();
    await page.waitForTimeout(140);
    const visible = page.locator(`#reference-grid .source-project-card[data-category="${category}"]:visible`);
    const visibleCount = await visible.count();
    assert(visibleCount === count, `${profile.name}: ${category} filter expected ${count} projects, got ${visibleCount}`);

    for (let index = 0; index < visibleCount; index += 1) {
      const card = visible.nth(index);
      const title = (await card.locator('h3').textContent())?.trim() || `${category} ${index + 1}`;
      await ensureImageLoaded(card.locator('.reference-image img'), profile.name, `${title} lead`);
      await assertLeadContained(card, profile.name, title);
      const thumbs = card.locator('.project-thumbs img');
      for (let thumb = 0; thumb < await thumbs.count(); thumb += 1) {
        await ensureImageLoaded(thumbs.nth(thumb), profile.name, `${title} thumbnail ${thumb + 1}`);
      }
    }

    if (category === 'balkone' || category === 'stahlbau') {
      await visible.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      await page.screenshot({ path: `${outDir}/${profile.name}-${category}.png`, fullPage: false });
    }
  }

  await page.locator('[data-filter="medallions"]').first().click();
  await page.waitForTimeout(180);
  const medallions = page.locator('#specialarbeiten .medallion-item');
  const medallionCount = await medallions.count();
  assert(medallionCount >= 40, `${profile.name}: medallion gallery unexpectedly incomplete (${medallionCount})`);
  for (let index = 0; index < Math.min(12, medallionCount); index += 1) {
    await ensureImageLoaded(medallions.nth(index).locator('img'), profile.name, `medallion ${index + 1}`);
  }

  if (profile.name === 'desktop-chromium') {
    const toggle = page.locator('.medallion-toggle');
    await toggle.click();
    assert(await toggle.getAttribute('aria-expanded') === 'true', `${profile.name}: medallion gallery did not expand`);
    for (let index = 12; index < medallionCount; index += 1) {
      await ensureImageLoaded(medallions.nth(index).locator('img'), profile.name, `medallion ${index + 1}`);
    }
    await verifyAllSourceImageUrls(page, profile.name);
  }

  await medallions.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await page.screenshot({ path: `${outDir}/${profile.name}-medallions.png`, fullPage: false });

  await page.locator('[data-filter="all"]').first().click();
  const visibleCopy = await page.locator('body').innerText();
  const forbidden = [
    'Mehr echte Projekte. Weniger Werbetext.',
    'Diese Demo macht daraus',
    'auf der bestehenden Website',
    'auf der bestehenden Seite',
    'bestehende Larasser-Seite',
    'auf dem bestehenden Webauftritt',
    'öffentlicher Projektbestand',
    'vollständig nach Bereichen erfasst',
  ];
  const leaks = forbidden.filter((needle) => visibleCopy.toLowerCase().includes(needle.toLowerCase()));
  assert(leaks.length === 0, `${profile.name}: internal migration/audit wording is visible: ${leaks.join(', ')}`);
  assert(await page.locator('.source-coverage-panel').count() === 0, `${profile.name}: internal source coverage panel is visible`);
  assert(await page.locator('.source-gallery-links').count() === 0, `${profile.name}: migration source links are visible`);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(horizontalOverflow <= 1, `${profile.name}: source-complete UI has horizontal overflow (${horizontalOverflow}px)`);
  assert(errors.length === 0, `${profile.name}: page errors: ${errors.join(' | ')}`);

  await browser.close();
}

console.log('Source-complete QA passed on desktop, Android and iPhone/WebKit with 37 reference groups and source-gallery image health checks.');
