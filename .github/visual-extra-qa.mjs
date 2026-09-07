import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const outDir = 'artifacts/browser-qa';
await fs.mkdir(outDir, { recursive: true });

const profiles = [
  { name: 'desktop-chromium', engine: chromium, context: { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 } },
  { name: 'android-chromium', engine: chromium, context: { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36' } },
  { name: 'iphone-webkit', engine: webkit, context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' } },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function settle(page) {
  await page.evaluate(async () => {
    const visible = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.bottom > -200 && r.top < innerHeight + 200 && r.right > 0 && r.left < innerWidth;
    });
    await Promise.all(visible.map(async (img) => {
      if (!img.complete) await new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 4000);
      });
      try { await img.decode(); } catch {}
    }));
  });
  await page.waitForTimeout(180);
}

async function shot(page, profile, label, selector) {
  const target = page.locator(selector).first();
  assert(await target.count() === 1, `${profile}: missing ${selector}`);
  await target.evaluate((element) => {
    const header = document.querySelector('.site-header');
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const top = element.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(220);
  await settle(page);
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(metrics.scrollWidth <= metrics.width + 1, `${profile}: horizontal overflow near ${label}`);
  await page.screenshot({ path: `${outDir}/${profile}-${label}.png`, fullPage: false });
}

for (const profile of profiles) {
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => [...document.styleSheets].some((sheet) => sheet.href?.endsWith('/visual-fixes.css')));

  await shot(page, profile.name, 'betrieb', '#betrieb');
  await shot(page, profile.name, 'form-fields', '#project-form');
  await shot(page, profile.name, 'footer', '.site-footer');

  const formMetrics = await page.locator('#project-form').evaluate((form) => {
    const r = form.getBoundingClientRect();
    return { width: r.width, left: r.left, right: r.right, viewport: window.innerWidth };
  });
  assert(formMetrics.width > 0 && formMetrics.left >= -1 && formMetrics.right <= formMetrics.viewport + 1, `${profile.name}: inquiry form escapes viewport`);

  const visibleCopy = await page.locator('body').innerText();
  const forbidden = ['öffentlicher Projektbestand', 'diese Demo macht daraus', 'bestehende Website', 'migration'];
  assert(forbidden.every((text) => !visibleCopy.toLowerCase().includes(text.toLowerCase())), `${profile.name}: internal migration wording visible`);

  await browser.close();
  console.log(`${profile.name}: Betrieb/form/footer visual QA passed`);
}
