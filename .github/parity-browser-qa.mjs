import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const out = 'artifacts/parity-browser-qa';
await fs.mkdir(out, { recursive: true });

const scenarios = [
  { name: 'desktop-chromium', browserType: chromium, context: { viewport: { width: 1440, height: 1000 } } },
  { name: 'android-chromium', browserType: chromium, context: { ...devices['Pixel 7'] } },
  { name: 'iphone-webkit', browserType: webkit, context: { ...devices['iPhone 15'] } },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function checkNoHorizontalOverflow(page, label) {
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  assert(dims.sw <= dims.cw + 1, `${label}: horizontal overflow ${dims.sw} > ${dims.cw}`);
}

async function checkStatus(page, path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  assert(response?.ok(), `${path}: HTTP ${response?.status()}`);
}

for (const scenario of scenarios) {
  const browser = await scenario.browserType.launch({ headless: true });
  const context = await browser.newContext(scenario.context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

  await checkStatus(page, '/');
  await page.locator('h1').waitFor({ state: 'visible' });
  const homeHeading = (await page.locator('h1').innerText()).toLowerCase();
  assert(homeHeading.includes('metallbau') && homeHeading.includes('larasser'), `${scenario.name}: homepage H1 missing`);
  assert(await page.locator('.brand-mark').first().isVisible(), `${scenario.name}: official mark not visible`);
  assert(await page.locator('a[href="referenzen/treppen-and-gelander/"]').count() > 0, `${scenario.name}: Treppen route missing`);
  assert(await page.locator('a[href="referenzen/sonderanfertigungen/"]').count() > 0, `${scenario.name}: Sonderanfertigungen route missing`);
  const facts = await page.locator('.fact-grid').innerText();
  assert(facts.includes('1996') && facts.includes('EXC2'), `${scenario.name}: source-safe homepage facts missing`);
  assert(!facts.includes('29') && !facts.includes('Mitarbeiter'), `${scenario.name}: disputed counters must not be prominent`);
  await checkNoHorizontalOverflow(page, `${scenario.name} homepage`);
  await page.screenshot({ path: `${out}/${scenario.name}-home.png`, fullPage: true });

  if (scenario.name !== 'desktop-chromium') {
    await page.evaluate(() => window.scrollTo(0, Math.min(700, document.body.scrollHeight / 3)));
    await page.locator('.nav-toggle').click();
    assert(await page.evaluate(() => document.body.classList.contains('nav-open')), `${scenario.name}: mobile menu did not open`);
    assert(await page.locator('.site-nav').isVisible(), `${scenario.name}: mobile nav invisible`);
    const navBg = await page.locator('.site-nav').evaluate((el) => getComputedStyle(el).backgroundColor);
    assert(navBg === 'rgb(255, 255, 255)', `${scenario.name}: mobile nav must be opaque, got ${navBg}`);
    await page.screenshot({ path: `${out}/${scenario.name}-menu.png` });
    await page.locator('.nav-toggle').click();
  }

  await checkStatus(page, '/referenzen/');
  assert(await page.locator('.reference-category-card').count() === 8, `${scenario.name}: expected 8 reference categories`);
  const hubText = await page.locator('main').innerText();
  assert(hubText.includes('Sonderanfertigungen'), `${scenario.name}: Sonderanfertigungen missing from hub`);
  assert(hubText.includes('Lohnfertigung'), `${scenario.name}: Lohnfertigung missing from hub`);
  await checkNoHorizontalOverflow(page, `${scenario.name} reference hub`);
  await page.screenshot({ path: `${out}/${scenario.name}-reference-hub.png`, fullPage: true });

  await checkStatus(page, '/referenzen/treppen-and-gelander/');
  await page.locator('.project').first().waitFor({ state: 'visible' });
  assert(await page.locator('.project').count() === 9, `${scenario.name}: expected 9 Treppen projects`);
  assert((await page.locator('.project').first().innerText()).includes('Geschmiedete Geländer für den Garten'), `${scenario.name}: first Treppen project mismatch`);
  assert(await page.locator('.gallery img').count() >= 40, `${scenario.name}: Treppen image set incomplete`);
  await checkNoHorizontalOverflow(page, `${scenario.name} Treppen`);
  await page.screenshot({ path: `${out}/${scenario.name}-treppen.png`, fullPage: true });

  const firstGalleryButton = page.locator('.gallery button').first();
  await firstGalleryButton.click();
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${scenario.name}: lightbox did not open`);
  await page.locator('.lightbox-close').click();

  await checkStatus(page, '/referenzen/sonderanfertigungen/');
  assert(await page.locator('.project').count() === 6, `${scenario.name}: expected 6 curated Sonderanfertigungen`);
  assert((await page.locator('main').innerText()).includes('Schachtisch'), `${scenario.name}: Schachtisch missing from Sonderanfertigungen`);
  assert(await page.locator('[data-static-gallery] img').count() >= 20, `${scenario.name}: Sonderanfertigungen gallery incomplete`);
  await checkNoHorizontalOverflow(page, `${scenario.name} Sonderanfertigungen`);
  await page.locator('[data-static-gallery] button').first().click();
  assert(await page.locator('#lightbox').evaluate((el) => el.open), `${scenario.name}: Sonderanfertigungen lightbox did not open`);
  await page.locator('.lightbox-close').click();

  await checkStatus(page, '/referenzen/medallions/');
  await page.locator('[data-medallion]').first().waitFor({ state: 'visible' });
  assert(await page.locator('[data-medallion]').count() === 44, `${scenario.name}: expected 44 medallions`);
  await checkNoHorizontalOverflow(page, `${scenario.name} Medallions`);

  await checkStatus(page, '/kontakt/?projekt=Sonderanfertigungen');
  assert(await page.locator('#project-form').isVisible(), `${scenario.name}: project form missing`);
  assert(await page.locator('#files').count() === 1, `${scenario.name}: file upload missing`);
  assert(await page.locator('#project-type').inputValue() === 'Sonderanfertigungen', `${scenario.name}: project prefill failed`);
  assert((await page.locator('main').innerText()).includes('Stephan Larasser'), `${scenario.name}: Stephan contact missing`);
  assert((await page.locator('main').innerText()).includes('Martin Larasser'), `${scenario.name}: Martin contact missing`);
  await checkNoHorizontalOverflow(page, `${scenario.name} contact`);
  await page.screenshot({ path: `${out}/${scenario.name}-contact.png`, fullPage: true });

  await checkStatus(page, '/referenzen/lohnbiegen-and-lohnschneiden/');
  const machineText = await page.locator('main').innerText();
  assert(machineText.includes('Baykal APHS 31160'), `${scenario.name}: APHS machine missing`);
  assert(machineText.includes('Baykal HGL 3108'), `${scenario.name}: HGL machine missing`);
  assert(machineText.includes('3.100 mm'), `${scenario.name}: machine dimensions missing`);
  assert(await page.locator('[data-part-inquiry]').isVisible(), `${scenario.name}: Bauteilanfrage missing`);
  assert(await page.locator('.part-shape-card').count() === 4, `${scenario.name}: expected four inquiry choices`);
  assert(await page.locator('[data-part-inquiry] #files').count() === 1, `${scenario.name}: Bauteilanfrage file upload missing`);
  await page.locator('input[name="quantity"]').fill('3');
  await page.locator('select[name="material"]').selectOption({ label: 'Stahl' });
  await page.locator('input[name="thickness"]').fill('2');
  await page.locator('input[name="length"]').fill('800');
  await page.locator('input[name="width"]').fill('300');
  await page.locator('input[name="angle"]').fill('90');
  await page.locator('input[name="bends"]').fill('2');
  const configSummary = await page.locator('[data-config-summary]').innerText();
  assert(configSummary.includes('Stückzahl: 3'), `${scenario.name}: quantity summary missing`);
  assert(configSummary.includes('Material: Stahl'), `${scenario.name}: material summary missing`);
  assert(configSummary.includes('Biegewinkel: 90°'), `${scenario.name}: angle summary missing`);
  assert(configSummary.includes('Anzahl Biegungen: 2'), `${scenario.name}: bends summary missing`);
  await checkNoHorizontalOverflow(page, `${scenario.name} Bauteilanfrage`);
  await page.screenshot({ path: `${out}/${scenario.name}-bauteilanfrage.png`, fullPage: true });

  for (const legalPath of ['/impressum/', '/datenschutzerklarung/', '/uber-uns/']) {
    await checkStatus(page, legalPath);
    await checkNoHorizontalOverflow(page, `${scenario.name} ${legalPath}`);
  }

  assert(errors.length === 0, `${scenario.name}: browser errors:\n${errors.join('\n')}`);
  await browser.close();
}

console.log('Parity browser QA passed for desktop Chromium, Android Chromium and iPhone WebKit.');
