import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const outDir = 'artifacts/browser-qa';
await fs.mkdir(outDir, { recursive: true });

const profiles = [
  { name: 'desktop-chromium', engine: chromium, context: { viewport: { width: 1440, height: 1000 } }, mobile: false },
  { name: 'android-chromium', engine: chromium, context: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36' }, mobile: true },
  { name: 'iphone-webkit', engine: webkit, context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' }, mobile: true },
];

const expectedProjects = { treppen: 9, tore: 6, balkone: 7, stahlbau: 5, interior: 9 };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function settle(page, ms = 180) {
  await page.waitForTimeout(ms);
  await page.evaluate(async () => {
    const visible = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.bottom > -150 && r.top < innerHeight + 150 && r.right > 0 && r.left < innerWidth;
    });
    await Promise.all(visible.map(async (img) => {
      if (!img.complete) await new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 5000);
      });
      try { await img.decode(); } catch {}
    }));
  });
}

async function shot(page, profile, label, selector = null) {
  if (selector) {
    const target = page.locator(selector).first();
    assert(await target.count() === 1, `${profile}: missing screenshot target ${selector}`);
    await target.scrollIntoViewIfNeeded();
  }
  await settle(page);
  await page.screenshot({ path: `${outDir}/${profile}-${label}.png`, fullPage: false });
}

async function waitForUX(page) {
  await page.waitForFunction(() => (
    window.__larasserReferenceUX
    && document.querySelectorAll('#reference-grid .source-project-card').length === 36
    && document.querySelectorAll('#reference-grid .medallions-inline .medallion-item').length > 0
    && !document.querySelector('#specialarbeiten')
  ));
}

async function assertNoOverflow(page, profile, label) {
  const state = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(state.scrollWidth <= state.width + 1, `${profile}: horizontal overflow ${label} (${state.scrollWidth}px > ${state.width}px)`);
}

async function assertMobileMenuDestination(page, profile, href) {
  // Start far from the destination. Use DOM click for the fixed hamburger so the
  // test itself cannot scroll the document before the app captures its lock position.
  await page.evaluate(() => window.scrollTo(0, Math.max(0, document.documentElement.scrollHeight * 0.62)));
  await page.waitForTimeout(80);
  const before = await page.evaluate(() => window.scrollY);

  await page.locator('.nav-toggle').evaluate((el) => el.click());
  await page.waitForTimeout(120);
  assert(await page.evaluate(() => document.body.classList.contains('nav-open')), `${profile}: menu did not open before ${href}`);

  const link = page.locator(`.site-nav a[href="${href}"]`).first();
  assert(await link.count() === 1, `${profile}: menu link ${href} missing`);
  await link.evaluate((el) => el.click());
  await page.waitForTimeout(850);

  const state = await page.evaluate((hash) => {
    const target = document.querySelector(hash);
    const header = document.querySelector('.site-header');
    const tr = target?.getBoundingClientRect();
    const hr = header?.getBoundingClientRect();
    return {
      open: document.body.classList.contains('nav-open'),
      bodyPosition: getComputedStyle(document.body).position,
      currentY: window.scrollY,
      targetTop: tr?.top ?? -9999,
      headerBottom: hr?.bottom ?? 0,
    };
  }, href);

  assert(!state.open, `${profile}: menu stayed open after ${href}`);
  assert(state.bodyPosition !== 'fixed', `${profile}: body stayed locked after ${href}`);
  assert(Math.abs(state.currentY - before) > 40 || Math.abs(state.targetTop - state.headerBottom) < 90,
    `${profile}: mobile menu destination ${href} did not leave the old scroll position`);
  assert(state.targetTop >= state.headerBottom - 10 && state.targetTop <= state.headerBottom + 100,
    `${profile}: mobile menu destination ${href} missed target (${state.targetTop}px vs header ${state.headerBottom}px)`);
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await waitForUX(page);

  assert(await page.title() === 'Metallbau Larasser – Demo', `${profile.name}: unexpected title`);
  assert((await page.locator('h1').innerText()).includes('Metall. Präzise.'), `${profile.name}: hero missing`);
  await assertNoOverflow(page, profile.name, 'at top');
  await shot(page, profile.name, 'top');

  if (profile.mobile) {
    await page.evaluate(() => window.scrollTo(0, document.querySelector('#leistungen').offsetTop + 120));
    await page.waitForTimeout(80);
    await page.locator('.nav-toggle').evaluate((el) => el.click());
    await page.waitForTimeout(120);

    const navState = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav')?.getBoundingClientRect();
      const lockedY = Math.max(0, -(Number.parseFloat(document.body.style.top || '0') || 0));
      return {
        open: document.body.classList.contains('nav-open'),
        bodyPosition: getComputedStyle(document.body).position,
        navWidth: nav?.width || 0,
        navHeight: nav?.height || 0,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        lockedY,
        extraInterior: !!document.querySelector('.site-nav a[href="#specialarbeiten"]'),
        stickyVisibility: getComputedStyle(document.querySelector('.mobile-actions')).visibility,
      };
    });

    assert(navState.open && navState.bodyPosition === 'fixed', `${profile.name}: mobile overlay/scroll lock failed`);
    assert(navState.navWidth >= navState.viewportWidth - 2 && navState.navHeight >= navState.viewportHeight - 2, `${profile.name}: menu does not cover viewport`);
    assert(!navState.extraInterior, `${profile.name}: obsolete Interior duplicate nav link still exists`);
    assert(navState.stickyVisibility === 'hidden', `${profile.name}: sticky CTA covers open menu`);
    await shot(page, profile.name, 'menu-open');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(140);
    assert(!(await page.evaluate(() => document.body.classList.contains('nav-open'))), `${profile.name}: Escape did not close menu`);
    const afterEscape = await page.evaluate(() => window.scrollY);
    assert(Math.abs(afterEscape - navState.lockedY) <= 5, `${profile.name}: Escape failed to restore locked scroll position (${navState.lockedY} -> ${afterEscape})`);

    for (const href of ['#leistungen', '#referenzen', '#lohnfertigung', '#betrieb', '#anfrage']) {
      await assertMobileMenuDestination(page, profile.name, href);
    }
  } else {
    assert(!(await page.locator('.nav-toggle').isVisible()), `${profile.name}: hamburger visible on desktop`);
  }

  // References must start as a compact category chooser, not a giant mixed catalog.
  await page.locator('#referenzen').scrollIntoViewIfNeeded();
  await page.waitForTimeout(160);
  assert(await page.locator('#referenzen [data-filter="all"]').count() === 0, `${profile.name}: misleading Alle category still visible`);
  assert(await page.locator('#referenzen .filter-chip[data-filter]').count() === 6, `${profile.name}: expected six reference categories`);
  assert(await page.locator('#reference-grid .source-project-card:visible').count() === 0, `${profile.name}: project cards visible before category selection`);
  assert(await page.locator('#reference-grid .medallions-inline:visible').count() === 0, `${profile.name}: Medallions visible before category selection`);
  assert(await page.locator('.archive-panel').count() === 0, `${profile.name}: duplicate project archive still exists`);
  assert(await page.locator('#specialarbeiten').count() === 0, `${profile.name}: duplicate Interior/Medallion section still exists`);
  assert(await page.locator('.reference-picker-note').isVisible(), `${profile.name}: category selection guidance missing`);
  await assertNoOverflow(page, profile.name, 'reference overview');
  await shot(page, profile.name, 'references-overview', '#referenzen .reference-category-bar');

  const sourceCounts = await page.evaluate(async () => {
    const medallions = await (await fetch('data/medallions.json', { cache: 'no-store' })).json();
    return { medallions: medallions.images.length };
  });
  const medalBadge = Number(await page.locator('[data-filter="medallions"] small').innerText());
  assert(medalBadge === sourceCounts.medallions, `${profile.name}: Medallions badge ${medalBadge} != source image count ${sourceCounts.medallions}`);

  for (const [category, expected] of Object.entries(expectedProjects)) {
    await page.locator(`[data-filter="${category}"]`).click();
    await page.waitForTimeout(130);
    const state = await page.evaluate((category) => ({
      selected: window.__larasserReferenceUX?.selectedCategory,
      visibleCards: [...document.querySelectorAll('#reference-grid .source-project-card')].filter((card) => getComputedStyle(card).display !== 'none').length,
      wrongCards: [...document.querySelectorAll('#reference-grid .source-project-card')].filter((card) => getComputedStyle(card).display !== 'none' && card.dataset.category !== category).length,
      medalVisible: !!document.querySelector('#reference-grid .medallions-inline') && getComputedStyle(document.querySelector('#reference-grid .medallions-inline')).display !== 'none',
    }), category);
    assert(state.selected === category, `${profile.name}: ${category} did not become selected`);
    assert(state.visibleCards === expected && state.wrongCards === 0, `${profile.name}: ${category} expected ${expected} exclusive cards, got ${state.visibleCards}`);
    assert(!state.medalVisible, `${profile.name}: Medallions leaked into ${category}`);
    assert(Number(await page.locator(`[data-filter="${category}"] small`).innerText()) === expected, `${profile.name}: ${category} badge mismatch`);
  }

  await page.locator('[data-filter="balkone"]').click();
  await shot(page, profile.name, 'references-balkone', '#reference-grid');

  await page.locator('[data-filter="medallions"]').click();
  await page.waitForTimeout(150);
  assert(await page.locator('#reference-grid .source-project-card:visible').count() === 0, `${profile.name}: project cards visible in Medallions category`);
  assert(await page.locator('#reference-grid .medallions-inline:visible').count() === 1, `${profile.name}: Medallions category did not reveal gallery`);
  const medallionItems = await page.locator('#reference-grid .medallion-item').count();
  assert(medallionItems === sourceCounts.medallions, `${profile.name}: Medallion DOM count ${medallionItems} != ${sourceCounts.medallions}`);
  const medallionToggle = page.locator('#reference-grid .medallion-toggle');
  assert((await medallionToggle.innerText()).includes(String(sourceCounts.medallions)), `${profile.name}: Medallion expand button has wrong total`);
  await shot(page, profile.name, 'references-medallions', '#reference-grid .medallions-inline');

  await page.locator('#reference-grid .medallion-item:visible').first().click();
  await page.waitForTimeout(100);
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${profile.name}: Medallion lightbox did not open`);
  await page.locator('.lightbox-close').click();

  await page.locator('.reference-back').click();
  assert(await page.locator('#reference-grid .source-project-card:visible').count() === 0, `${profile.name}: back-to-categories did not hide projects`);
  assert(await page.locator('#reference-grid .medallions-inline:visible').count() === 0, `${profile.name}: back-to-categories did not hide Medallions`);

  // Service cards should jump into the matching category, without duplicate sections.
  await page.locator('[data-filter-link="interior"]').click();
  await page.waitForTimeout(650);
  assert(await page.evaluate(() => window.__larasserReferenceUX?.selectedCategory) === 'interior', `${profile.name}: Interior service card did not select Interior`);
  assert(await page.locator('#reference-grid .source-project-card[data-category="interior"]:visible').count() === 9, `${profile.name}: Interior service card did not expose 9 projects`);

  await page.locator('#reference-grid .source-project-card[data-category="interior"]:visible .reference-image').first().click();
  await page.waitForTimeout(100);
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${profile.name}: project lightbox did not open`);
  await page.locator('.lightbox-close').click();

  await assertNoOverflow(page, profile.name, 'after reference interactions');
  assert(pageErrors.length === 0, `${profile.name}: page errors: ${pageErrors.join(' | ')}`);

  await browser.close();
  console.log(`PASS ${profile.name}: category-first references and mobile menu destinations verified`);
}
