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

const expectedProjects = { treppen: 9, tore: 6, balkone: 7, stahlbau: 5, interior: 9 };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureImageLoaded(image, profile, label) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async (img) => {
    if (!img.complete) await new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 7000);
    });
    try { await img.decode(); } catch {}
  });
  const health = await image.evaluate((img) => ({ complete: img.complete, width: img.naturalWidth, height: img.naturalHeight, src: img.currentSrc || img.src }));
  assert(health.complete && health.width > 0 && health.height > 0, `${profile}: ${label} broken image: ${health.src}`);
}

async function assertLeadContained(card, profile, label) {
  const state = await card.evaluate((element) => {
    const frame = element.querySelector('.reference-image');
    const image = frame?.querySelector('img');
    if (!frame || !image) return null;
    const f = frame.getBoundingClientRect();
    const i = image.getBoundingClientRect();
    return { f: [f.left, f.top, f.right, f.bottom], i: [i.left, i.top, i.right, i.bottom] };
  });
  assert(state, `${profile}: ${label} missing image frame`);
  const [fl, ft, fr, fb] = state.f;
  const [il, it, ir, ib] = state.i;
  assert(il >= fl - 1.5 && ir <= fr + 1.5 && it >= ft - 1.5 && ib <= fb + 1.5, `${profile}: ${label} image escapes frame`);
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

  assert(broken.length === 0, `${profile}: ${broken.length} source images failed: ${JSON.stringify(broken.slice(0, 5))}`);
  console.log(`${profile}: verified ${urls.length} unique source gallery image URLs`);
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__larasserReferenceUX && document.querySelectorAll('#reference-grid .source-project-card').length === 36 && document.querySelectorAll('#reference-grid .medallion-item').length > 0);

  const source = await page.evaluate(async () => {
    const medallions = await (await fetch('data/medallions.json', { cache: 'no-store' })).json();
    return { medallions: medallions.images.length };
  });

  assert(await page.locator('#referenzen [data-filter="all"]').count() === 0, `${profile.name}: old Alle filter still present`);
  assert(await page.locator('.archive-panel').count() === 0, `${profile.name}: old archive panel still present`);
  assert(await page.locator('#specialarbeiten').count() === 0, `${profile.name}: old duplicate special section still present`);
  assert(await page.locator('#reference-grid .source-project-card:visible').count() === 0, `${profile.name}: overview leaks project cards`);
  assert(await page.locator('#reference-grid .medallions-inline:visible').count() === 0, `${profile.name}: overview leaks Medallions`);

  for (const [category, expected] of Object.entries(expectedProjects)) {
    const chip = page.locator(`[data-filter="${category}"]`);
    assert(await chip.count() === 1, `${profile.name}: missing ${category} chip`);
    assert(Number(await chip.locator('small').innerText()) === expected, `${profile.name}: ${category} badge mismatch`);
    await chip.click();
    await page.waitForTimeout(100);
    const visible = page.locator(`#reference-grid .source-project-card[data-category="${category}"]:visible`);
    assert(await visible.count() === expected, `${profile.name}: ${category} expected ${expected} projects`);
    for (let i = 0; i < await visible.count(); i += 1) {
      const card = visible.nth(i);
      const title = (await card.locator('h3').innerText()).trim();
      await ensureImageLoaded(card.locator('.reference-image img'), profile.name, `${title} lead`);
      await assertLeadContained(card, profile.name, title);
    }
    if (category === 'balkone' || category === 'stahlbau') {
      await visible.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await page.screenshot({ path: `${outDir}/${profile.name}-${category}.png`, fullPage: false });
    }
  }

  const medalChip = page.locator('[data-filter="medallions"]');
  const medalBadge = Number(await medalChip.locator('small').innerText());
  assert(medalBadge === source.medallions, `${profile.name}: medallion badge matches image count failed (${medalBadge} != ${source.medallions})`);
  await medalChip.click();
  await page.waitForTimeout(120);
  const medallions = page.locator('#reference-grid .medallion-item');
  assert(await medallions.count() === source.medallions, `${profile.name}: Medallion gallery count ${await medallions.count()} != ${source.medallions}`);
  assert(await page.locator('#reference-grid .source-project-card:visible').count() === 0, `${profile.name}: project cards leak into Medallions`);

  for (let i = 0; i < Math.min(12, source.medallions); i += 1) {
    await ensureImageLoaded(medallions.nth(i).locator('img'), profile.name, `medallion ${i + 1}`);
  }

  if (profile.name === 'desktop-chromium') {
    const toggle = page.locator('#reference-grid .medallion-toggle');
    await toggle.click();
    assert(await toggle.getAttribute('aria-expanded') === 'true', `${profile.name}: Medallion gallery did not expand`);
    for (let i = 12; i < source.medallions; i += 1) {
      await ensureImageLoaded(medallions.nth(i).locator('img'), profile.name, `medallion ${i + 1}`);
    }
    await verifyAllSourceImageUrls(page, profile.name);
  }

  await page.locator('#reference-grid .medallions-inline').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${outDir}/${profile.name}-medallions.png`, fullPage: false });

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
  assert(leaks.length === 0, `${profile.name}: internal migration/audit wording visible: ${leaks.join(', ')}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert(overflow <= 1, `${profile.name}: horizontal overflow ${overflow}px`);
  assert(errors.length === 0, `${profile.name}: page errors: ${errors.join(' | ')}`);

  await browser.close();
}

console.log('Source-complete QA passed: category-first UI, source project counts, dynamic Medallion image count and image health verified.');
