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

async function settleImages(page) {
  await page.evaluate(async () => {
    const visible = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.bottom > -200 && r.top < window.innerHeight + 200 && r.right > 0 && r.left < window.innerWidth;
    });
    await Promise.all(visible.map(async (img) => {
      if (!img.complete) await new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 5000);
      });
      try { await img.decode(); } catch { /* explicit health checks below */ }
    }));
  });
}

async function viewportShot(page, profileName, label, selector) {
  if (selector) {
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }
  await settleImages(page);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${outDir}/${profileName}-${label}.png`, fullPage: false });
}

async function assertContainedImages(page, profileName, frameSelector, imageSelector) {
  const failures = await page.evaluate(({ frameSelector, imageSelector }) => {
    const frames = [...document.querySelectorAll(frameSelector)];
    const problems = [];
    for (const frame of frames) {
      const image = frame.matches(imageSelector) ? frame : frame.querySelector(imageSelector);
      if (!image) continue;
      const f = frame.getBoundingClientRect();
      const i = image.getBoundingClientRect();
      const tolerance = 1.5;
      if (i.left < f.left - tolerance || i.right > f.right + tolerance || i.top < f.top - tolerance || i.bottom > f.bottom + tolerance) {
        problems.push({ frame: frame.className, frameRect: [f.left, f.top, f.right, f.bottom], imageRect: [i.left, i.top, i.right, i.bottom] });
      }
    }
    return problems;
  }, { frameSelector, imageSelector });
  assert(failures.length === 0, `${profileName}: images escape their frames: ${JSON.stringify(failures.slice(0, 3))}`);
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
  await page.waitForFunction(() => [...document.styleSheets].some((sheet) => sheet.href?.endsWith('/visual-fixes.css')));
  await viewportShot(page, profile.name, 'top');

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
    await page.locator('#leistungen').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const scrollBeforeMenu = await page.evaluate(() => window.scrollY);
    assert(scrollBeforeMenu > 100, `${profile.name}: menu regression test did not start from a scrolled page`);

    const toggle = page.locator('.nav-toggle');
    assert(await toggle.isVisible(), `${profile.name}: mobile menu button is not visible`);
    await toggle.click();
    await page.waitForTimeout(300);

    const navState = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav');
      const header = document.querySelector('.site-header');
      const mobileActions = document.querySelector('.mobile-actions');
      const nr = nav?.getBoundingClientRect();
      const hr = header?.getBoundingClientRect();
      return {
        open: document.body.classList.contains('nav-open'),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        header: hr ? { top: hr.top, left: hr.left, right: hr.right, bottom: hr.bottom, width: hr.width, height: hr.height } : null,
        nav: nr ? { top: nr.top, left: nr.left, right: nr.right, bottom: nr.bottom, width: nr.width, height: nr.height } : null,
        bodyPosition: getComputedStyle(document.body).position,
        actionsVisibility: mobileActions ? getComputedStyle(mobileActions).visibility : 'missing',
        interiorLink: !!nav?.querySelector('a[href="#specialarbeiten"]'),
      };
    });

    assert(navState.open, `${profile.name}: body.nav-open missing`);
    assert(navState.header && Math.abs(navState.header.left) <= 2 && navState.header.width >= navState.viewportWidth - 2, `${profile.name}: open-menu header does not span viewport width`);
    assert(navState.header && navState.header.top <= 2 && navState.header.height >= navState.viewportHeight - 2, `${profile.name}: open-menu header does not cover full viewport`);
    assert(navState.nav && navState.nav.left <= 2 && navState.nav.right >= navState.viewportWidth - 2, `${profile.name}: menu does not span viewport width`);
    assert(navState.nav && navState.nav.bottom >= navState.viewportHeight - 2, `${profile.name}: menu does not reach viewport bottom`);
    assert(navState.bodyPosition === 'fixed', `${profile.name}: background page is not hard-locked while menu is open`);
    assert(navState.actionsVisibility === 'hidden', `${profile.name}: sticky CTA remains visible over open menu`);
    assert(navState.interiorLink, `${profile.name}: Interior link missing from mobile menu`);

    await viewportShot(page, profile.name, 'menu-open');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    assert(!(await page.evaluate(() => document.body.classList.contains('nav-open'))), `${profile.name}: Escape did not close menu`);
    const scrollAfterMenu = await page.evaluate(() => window.scrollY);
    assert(Math.abs(scrollAfterMenu - scrollBeforeMenu) <= 3, `${profile.name}: closing menu changed scroll position (${scrollBeforeMenu} -> ${scrollAfterMenu})`);
    assert(await page.locator('.mobile-actions').isVisible(), `${profile.name}: sticky mobile actions missing`);
  } else {
    assert(!(await page.locator('.nav-toggle').isVisible()), `${profile.name}: hamburger should be hidden on desktop`);
    assert(!(await page.locator('.mobile-actions').isVisible()), `${profile.name}: mobile actions visible on desktop`);
  }

  for (const id of ['leistungen', 'referenzen', 'specialarbeiten', 'lohnfertigung', 'betrieb', 'anfrage']) {
    const section = page.locator(`#${id}`);
    assert(await section.count() === 1, `${profile.name}: missing #${id}`);
    const box = await section.boundingBox();
    assert(box && box.width > 0 && box.height > 0, `${profile.name}: #${id} has no layout box`);
  }

  const referenceCount = await page.locator('.reference-card').count();
  const archiveCount = await page.locator('.archive-list [data-category]').count();
  const interiorProjectCount = await page.locator('#specialarbeiten .special-project').count();
  assert(referenceCount >= 10, `${profile.name}: too few detailed reference cards (${referenceCount})`);
  assert(archiveCount >= 25, `${profile.name}: verified reference archive lost source projects (${archiveCount})`);
  assert(interiorProjectCount >= 9, `${profile.name}: Interior project coverage incomplete (${interiorProjectCount})`);
  assert(await page.locator('[data-filter="interior"]').count() === 1, `${profile.name}: Interior filter missing`);
  assert(await page.locator('[data-filter="medallions"]').count() === 1, `${profile.name}: Medallions filter missing`);
  assert(await page.locator('a[href="https://www.larasser-metallbau.de/referenzen/interior/"]').count() >= 1, `${profile.name}: Interior source gallery link missing`);
  assert(await page.locator('a[href="https://www.larasser-metallbau.de/referenzen/medallions/"]').count() >= 1, `${profile.name}: Medallions source gallery link missing`);

  await viewportShot(page, profile.name, 'references', '#referenzen .reference-tools');
  await settleImages(page);
  await assertContainedImages(page, profile.name, '.reference-image', 'img');

  await page.locator('[data-filter="tore"]').click();
  await page.waitForTimeout(100);
  const filterState = await page.evaluate(() => ({
    visibleCards: [...document.querySelectorAll('.reference-card')].filter((el) => !el.classList.contains('is-hidden')).length,
    wrongVisible: [...document.querySelectorAll('.reference-card')].filter((el) => !el.classList.contains('is-hidden') && el.dataset.category !== 'tore').length,
    wrongArchive: [...document.querySelectorAll('.archive-list [data-category]')].filter((el) => !el.classList.contains('is-hidden') && el.dataset.category !== 'tore').length,
  }));
  assert(filterState.visibleCards >= 4, `${profile.name}: Tore filter shows too few detailed cards`);
  assert(filterState.wrongVisible === 0 && filterState.wrongArchive === 0, `${profile.name}: Tore filter leaks other categories`);

  await page.locator('[data-filter="interior"]').click();
  await page.waitForTimeout(100);
  const visibleInteriorArchive = page.locator('.archive-list [data-category="interior"]:visible');
  assert(await visibleInteriorArchive.count() >= 9, `${profile.name}: Interior filter does not expose the verified Interior archive`);

  await page.locator('[data-filter="medallions"]').click();
  await page.waitForTimeout(100);
  assert(await page.locator('.archive-list [data-category="medallions"]:visible').count() >= 1, `${profile.name}: Medallions filter has no visible result`);

  await page.locator('[data-filter="all"]').click();
  const search = page.locator('.reference-search input');
  await search.fill('Schachtisch');
  await page.waitForTimeout(100);
  assert(await page.locator('.archive-list [data-category="interior"]:visible').filter({ hasText: 'Schachtisch' }).count() === 1, `${profile.name}: reference search cannot find Schachtisch`);
  await search.fill('');
  await page.locator('[data-filter="all"]').click();

  const archiveToggle = page.locator('.archive-toggle');
  assert(await archiveToggle.isVisible(), `${profile.name}: archive expand control missing`);
  await archiveToggle.click();
  assert(await archiveToggle.getAttribute('aria-expanded') === 'true', `${profile.name}: archive expand control failed`);

  await viewportShot(page, profile.name, 'interior-medallions', '#specialarbeiten .special-layout');
  const specialOverflow = await page.evaluate(() => {
    const section = document.querySelector('#specialarbeiten');
    const r = section?.getBoundingClientRect();
    return r ? { left: r.left, right: r.right, viewport: window.innerWidth } : null;
  });
  assert(specialOverflow && specialOverflow.left >= -1 && specialOverflow.right <= specialOverflow.viewport + 1, `${profile.name}: special work section overflows viewport`);

  const firstLightboxButton = page.locator('.reference-image[data-gallery-index]').first();
  assert(await firstLightboxButton.count() === 1, `${profile.name}: source-backed gallery control missing`);
  await firstLightboxButton.scrollIntoViewIfNeeded();
  await settleImages(page);
  await firstLightboxButton.click();
  await page.waitForTimeout(120);
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${profile.name}: lightbox did not open`);
  await page.locator('.lightbox-close').click();
  assert(!(await page.locator('#lightbox').evaluate((el) => el.open)), `${profile.name}: lightbox did not close`);

  await viewportShot(page, profile.name, 'fabrication', '#lohnfertigung .machine-grid');
  await assertContainedImages(page, profile.name, '.machine-card', 'img');

  const machineImageHealth = await page.evaluate(() => [...document.querySelectorAll('.machine-card > img')].map((img) => ({ src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 })));
  assert(machineImageHealth.every((item) => item.loaded), `${profile.name}: machine image failed to load: ${JSON.stringify(machineImageHealth)}`);

  const fabricationLink = page.locator('[data-prefill="Lohnbiegen & Lohnschneiden"]').first();
  await fabricationLink.scrollIntoViewIfNeeded();
  await fabricationLink.click();
  await page.waitForTimeout(700);
  const selectedProjectType = await page.locator('#project-type').inputValue();
  assert(selectedProjectType === 'Lohnbiegen & Lohnschneiden', `${profile.name}: fabrication prefill failed`);

  const anchorMetrics = await page.evaluate(() => {
    const header = document.querySelector('.site-header');
    const section = document.querySelector('#anfrage');
    return {
      headerBottom: header?.getBoundingClientRect().bottom ?? 0,
      sectionTop: section?.getBoundingClientRect().top ?? -1,
    };
  });
  assert(anchorMetrics.sectionTop >= anchorMetrics.headerBottom + 6, `${profile.name}: #anfrage is hidden behind fixed header (${anchorMetrics.sectionTop}px vs ${anchorMetrics.headerBottom}px)`);

  const form = page.locator('#project-form');
  assert(await form.isVisible(), `${profile.name}: inquiry form is not visible`);
  await viewportShot(page, profile.name, 'form', '#anfrage .inquiry-copy');

  const textSpacing = await page.evaluate(() => {
    const pairs = [
      ['#referenzen .section-label', '#referenzen h2'],
      ['#specialarbeiten .section-label', '#specialarbeiten h2'],
      ['#betrieb .section-label', '#betrieb h2'],
      ['#anfrage .section-label', '#anfrage h2'],
    ];
    return pairs.map(([a, b]) => {
      const first = document.querySelector(a)?.getBoundingClientRect();
      const second = document.querySelector(b)?.getBoundingClientRect();
      return { a, b, gap: first && second ? second.top - first.bottom : null };
    });
  });
  assert(textSpacing.every((item) => item.gap === null || item.gap >= 6), `${profile.name}: heading/label spacing is cramped: ${JSON.stringify(textSpacing)}`);

  const bottomMetrics = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(bottomMetrics.scrollWidth <= bottomMetrics.innerWidth + 1, `${profile.name}: horizontal overflow after interactions`);
  assert(pageErrors.length === 0, `${profile.name}: page errors: ${pageErrors.join(' | ')}`);
  assert(consoleErrors.length === 0, `${profile.name}: console errors: ${consoleErrors.join(' | ')}`);

  await browser.close();
  console.log(`PASS ${profile.name}`);
}
