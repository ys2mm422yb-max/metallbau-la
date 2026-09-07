import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const outDir = 'artifacts/browser-qa';
await fs.mkdir(outDir, { recursive: true });

const profiles = [
  {
    name: 'desktop-chromium',
    engine: chromium,
    context: { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 },
    mobile: false,
  },
  {
    name: 'android-chromium',
    engine: chromium,
    context: {
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    },
    mobile: true,
  },
  {
    name: 'iphone-webkit',
    engine: webkit,
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    },
    mobile: true,
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outDir}/${profile.name}-top.png`, fullPage: false });

  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() || '',
  }));
  assert(metrics.title === 'Metallbau Larasser – Demo', `${profile.name}: unexpected page title`);
  assert(metrics.h1.includes('Metall. Präzise.'), `${profile.name}: hero heading missing`);
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${profile.name}: horizontal overflow (${metrics.scrollWidth}px > ${metrics.innerWidth}px)`);
  assert(await page.locator('.site-header').isVisible(), `${profile.name}: header is not visible`);

  if (profile.mobile) {
    const toggle = page.locator('.nav-toggle');
    assert(await toggle.isVisible(), `${profile.name}: mobile menu button is not visible`);
    await toggle.click();
    await page.waitForTimeout(300);

    const navState = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav');
      const rect = nav?.getBoundingClientRect();
      return {
        open: document.body.classList.contains('nav-open'),
        top: rect?.top ?? -1,
        left: rect?.left ?? -1,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    });

    assert(navState.open, `${profile.name}: body.nav-open missing`);
    assert(Math.abs(navState.left) <= 2, `${profile.name}: menu left offset ${navState.left}px`);
    assert(navState.top <= 2, `${profile.name}: menu top offset ${navState.top}px`);
    assert(navState.width >= navState.viewportWidth - 2, `${profile.name}: menu width ${navState.width}px < viewport ${navState.viewportWidth}px`);
    assert(navState.height >= navState.viewportHeight - 2, `${profile.name}: menu height ${navState.height}px < viewport ${navState.viewportHeight}px`);
    assert(navState.bodyOverflow === 'hidden', `${profile.name}: body scroll is not locked while menu is open`);

    await page.screenshot({ path: `${outDir}/${profile.name}-menu-open.png`, fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    assert(!(await page.evaluate(() => document.body.classList.contains('nav-open'))), `${profile.name}: Escape did not close menu`);
    assert(await page.locator('.mobile-actions').isVisible(), `${profile.name}: sticky mobile actions missing`);
  } else {
    assert(!(await page.locator('.nav-toggle').isVisible()), `${profile.name}: hamburger should be hidden on desktop`);
    assert(!(await page.locator('.mobile-actions').isVisible()), `${profile.name}: mobile actions visible on desktop`);
  }

  for (const id of ['leistungen', 'referenzen', 'lohnfertigung', 'betrieb', 'anfrage']) {
    const section = page.locator(`#${id}`);
    assert(await section.count() === 1, `${profile.name}: missing #${id}`);
    const box = await section.boundingBox();
    assert(box && box.width > 0 && box.height > 0, `${profile.name}: #${id} has no layout box`);
  }

  const referenceCount = await page.locator('.reference-card').count();
  assert(referenceCount >= 10, `${profile.name}: too few reference cards (${referenceCount})`);

  await page.locator('[data-filter="tore"]').click();
  await page.waitForTimeout(80);
  const filterState = await page.evaluate(() => ({
    visibleCards: [...document.querySelectorAll('.reference-card')].filter((el) => !el.classList.contains('is-hidden')).length,
    wrongVisible: [...document.querySelectorAll('.reference-card')].filter((el) => !el.classList.contains('is-hidden') && el.dataset.category !== 'tore').length,
  }));
  assert(filterState.visibleCards >= 4, `${profile.name}: Tore filter shows too few cards`);
  assert(filterState.wrongVisible === 0, `${profile.name}: Tore filter leaks other categories`);
  await page.locator('[data-filter="all"]').click();

  const firstLightboxButton = page.locator('[data-lightbox-src]').first();
  await firstLightboxButton.scrollIntoViewIfNeeded();
  await firstLightboxButton.click();
  await page.waitForTimeout(120);
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${profile.name}: lightbox did not open`);
  await page.locator('.lightbox-close').click();
  assert(!(await page.locator('#lightbox').evaluate((el) => el.open)), `${profile.name}: lightbox did not close`);

  const fabricationLink = page.locator('[data-prefill="Lohnbiegen & Lohnschneiden"]').first();
  await fabricationLink.scrollIntoViewIfNeeded();
  await fabricationLink.click();
  await page.waitForTimeout(120);
  const selectedProjectType = await page.locator('#project-type').inputValue();
  assert(selectedProjectType === 'Lohnbiegen & Lohnschneiden', `${profile.name}: fabrication prefill failed`);

  const form = page.locator('#project-form');
  await form.scrollIntoViewIfNeeded();
  assert(await form.isVisible(), `${profile.name}: inquiry form is not visible`);

  const bottomMetrics = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(bottomMetrics.scrollWidth <= bottomMetrics.innerWidth + 1, `${profile.name}: horizontal overflow after interactions`);

  await page.screenshot({ path: `${outDir}/${profile.name}-full.png`, fullPage: true });
  assert(pageErrors.length === 0, `${profile.name}: page errors: ${pageErrors.join(' | ')}`);
  assert(consoleErrors.length === 0, `${profile.name}: console errors: ${consoleErrors.join(' | ')}`);

  await browser.close();
  console.log(`PASS ${profile.name}`);
}