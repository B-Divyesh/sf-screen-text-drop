import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const siteOrigin = 'http://127.0.0.1:4173';
const appOrigin = 'http://127.0.0.1:1420';

async function chooseGeneratedImage(page: Page, text: string): Promise<void> {
  await page.evaluate(async (label) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    context.font = 'bold 104px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, canvas.width / 2, canvas.height / 2);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), 'image/png'));
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], 'sample.png', { type: 'image/png' }));
    const input = document.querySelector<HTMLInputElement>('#image-file')!;
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
  await expect(page.locator('#capture-layer')).toBeVisible();
}

async function seriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page: page as never }).analyze();
  return results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
}

test('landing page states the job, audience, first action, and three facts', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle('Screen Text Drop — turn a screen region into text');
  await expect(page.locator('h1')).toHaveText(/Turn screen regions\s+into text/i);
  await expect(page.getByText('For desktop users who need text from a screen region.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Try it with sample data/i })).toBeVisible();
  await expect(page.locator('.hero-facts li')).toHaveText([
    'OCR runs on your device.',
    'Works offline after installation.',
    'Free core. Pro costs $12 once.',
  ]);
  expect(errors).toEqual([]);
});

test('all public routes pass serious and critical axe checks', async ({ page }) => {
  for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} horizontal overflow`).toBe(true);
    expect(await seriousAxeViolations(page), `${path} axe violations`).toEqual([]);
  }
});

test('legal pages have complete route metadata and named mobile home links', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('header').getByRole('link', { name: 'Screen Text Drop home' })).toBeVisible();
  }
});

test('@claim:sample-demo', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in the desktop demo sandbox.');
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#demo-output')).toContainText('route parser');
  await page.getByRole('tab', { name: 'Code' }).click();
  await expect(page.locator('#demo-output')).toContainText('keepQueryString');
});

test('@claim:demo-isolated', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in the desktop demo sandbox.');
  await page.addInitScript(() => localStorage.setItem('real:untouched', 'keep'));
  await page.goto('/demo/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:screen-text-drop:sample'))).not.toBeNull();
  await expect(page.evaluate(() => localStorage.getItem('sb_license:screen-text-drop'))).resolves.toBeNull();
  await page.getByRole('tab', { name: 'Table' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-output')).toContainText('route parser');
  await expect(page.evaluate(() => localStorage.getItem('real:untouched'))).resolves.toBe('keep');
  await expect(page.evaluate(() => localStorage.getItem('sb_license:screen-text-drop'))).resolves.toBeNull();
  await expect(page.evaluate(() => document.cookie)).resolves.toBe('');
});

test('@claim:demo-offline', async ({ browser }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in its own desktop browser context.');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${siteOrigin}/demo/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Clean sample text/i })).toBeVisible();
  await expect(page.locator('#demo-output')).toContainText('route parser');
  await context.close();
});

test('@claim:demo-local-network', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in the desktop demo sandbox.');
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Table' }).click();
  await expect(page.locator('#demo-output')).toContainText('Support link');
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.every((value) => new URL(value).origin === siteOrigin)).toBe(true);
});

test('@claim:desktop-sample', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop app is not a mobile product surface.');
  await page.goto(appOrigin);
  await page.getByRole('button', { name: 'Load sample project' }).click();
  await expect(page.locator('#result')).toHaveValue(/route parser strips the utm_source/);
  await expect(page.locator('#live')).toContainText('Sample project loaded');
});

test('@claim:local-ocr-copy-disposal @claim:offline-installed @claim:no-history-tracking @claim:keyboard-region-selection', async ({ page, context }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop app is not a mobile product surface.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: appOrigin });
  await page.route('**/*', (route) => new URL(route.request().url()).origin === appOrigin ? route.continue() : route.abort());
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(appOrigin);
  await chooseGeneratedImage(page, 'ORDER 7842');
  const captureUrl = await page.locator('#capture-image').getAttribute('src');
  expect(captureUrl).toMatch(/^blob:/);
  const initialLeft = await page.locator('#selection').evaluate((element) => getComputedStyle(element).left);
  const initialWidth = await page.locator('#selection').evaluate((element) => getComputedStyle(element).width);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.locator('#selection').evaluate((element) => getComputedStyle(element).left)).not.toBe(initialLeft);
  await page.keyboard.press('Shift+ArrowRight');
  await expect.poll(() => page.locator('#selection').evaluate((element) => getComputedStyle(element).width)).not.toBe(initialWidth);
  await page.keyboard.press('Enter');
  await expect(page.locator('#live')).toHaveText('Text ready', { timeout: 45_000 });
  await expect(page.locator('#result')).toHaveValue(/ORDER\s+7842/i);
  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/ORDER\s+7842/i);
  await expect(page.locator('#capture-image')).not.toHaveAttribute('src', /.+/);
  await expect(page.locator('#capture-layer')).toBeHidden();
  await expect(page.evaluate(async (url) => {
    try { await fetch(url!); return false; } catch { return true; }
  }, captureUrl)).resolves.toBe(true);
  expect(requests.every((value) => new URL(value).origin === appOrigin)).toBe(true);
  await expect(page.evaluate(() => Object.keys(localStorage))).resolves.toEqual([]);
});

test('@claim:capture-hotkey starts a user-initiated capture', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop shortcut is tested once.');
  await page.goto(appOrigin);
  const chooserPromise = page.waitForEvent('filechooser');
  await page.keyboard.press('Control+Shift+2');
  await chooserPromise;
  await expect(page.locator('#live')).toContainText('choose a screenshot');
});

test('@claim:capture-recovery', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop app is not a mobile product surface.');
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(appOrigin);
  await chooseGeneratedImage(page, 'CANCEL ME');
  const cancelledUrl = await page.locator('#capture-image').getAttribute('src');
  await page.keyboard.press('Escape');
  await expect(page.locator('#capture-layer')).toBeHidden();
  await expect(page.locator('#capture-image')).not.toHaveAttribute('src', /.+/);
  await expect(page.evaluate(async (url) => {
    try { await fetch(url!); return false; } catch { return true; }
  }, cancelledUrl)).resolves.toBe(true);

  await chooseGeneratedImage(page, 'SMALL');
  await page.mouse.move(40, 40);
  await page.mouse.down();
  await page.mouse.move(45, 45);
  await page.mouse.up();
  await expect(page.locator('#capture-feedback')).toHaveText('Selection is too small. Drag a larger region.');
  await page.keyboard.press('Escape');

  await page.evaluate(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array([1, 2, 3, 4])], 'broken.png', { type: 'image/png' }));
    const input = document.querySelector<HTMLInputElement>('#image-file')!;
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('#live')).toHaveText('The image could not be opened. Choose a PNG, JPEG, or WebP image and try again.');
  await expect(page.locator('#capture-layer')).toBeHidden();
  await expect(page.locator('#capture-image')).not.toHaveAttribute('src', /.+/);
  expect(pageErrors).toEqual([]);
});

test('@claim:language-packs', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop app is not a mobile product surface.');
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:screen-text-drop', 'fixture-valid-license');
    localStorage.setItem('sb_license:screen-text-drop:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  const modelRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('traineddata')) modelRequests.push(request.url()); });
  await page.goto(appOrigin);
  for (const [language, text] of [['spa', 'HOLA'], ['deu', 'HALLO']] as const) {
    await page.locator('#language').selectOption(language);
    await chooseGeneratedImage(page, text);
    await page.keyboard.press('Enter');
    await expect(page.locator('#live')).toHaveText('Text ready', { timeout: 45_000 });
    await expect(page.locator('#result')).toHaveValue(new RegExp(text, 'i'));
  }
  expect(modelRequests.some((url) => url.endsWith('/spa.traineddata.gz'))).toBe(true);
  expect(modelRequests.some((url) => url.endsWith('/deu.traineddata.gz'))).toBe(true);
  expect(modelRequests.every((url) => new URL(url).origin === appOrigin)).toBe(true);
  await expect(page.evaluate(async () => {
    const compressedSize = async (path: string) => Number((await fetch(path)).headers.get('Content-Length'));
    return {
      eng: await compressedSize('/ocr/eng.traineddata.gz'),
      spa: await compressedSize('/ocr/spa.traineddata.gz'),
      deu: await compressedSize('/ocr/deu.traineddata.gz'),
    };
  })).resolves.toEqual({ eng: 1_984_273, spa: 1_137_561, deu: 854_318 });
});

test('@claim:pro-license-return', async ({ page, context }) => {
  test.skip(test.info().project.name === 'mobile', 'The paid return is tested once in a desktop browser.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: siteOrigin });
  await page.goto('/');
  await expect(page.locator('.price-ticket')).toContainText('$12');
  await expect(page.locator('.price-ticket')).toContainText('one time');
  await expect(page.getByRole('link', { name: 'Buy Pro once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/screen-text-drop/checkout');
  await page.goto('/?license=returned-license');
  await expect(page).toHaveURL('/');
  await expect(page.locator('#restore-dialog')).toBeVisible();
  await expect(page.locator('#license-token')).toHaveValue('returned-license');
  await expect(page.locator('#license-message')).toContainText('Purchase returned');
  await page.getByRole('button', { name: 'Copy license for the app' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('returned-license');

  await page.route('https://api.sociobot.in/api/v1/products/screen-text-drop/verify?license=returned-license', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.goto(appOrigin);
  await page.getByRole('radio', { name: /Code/ }).click({ force: true });
  await expect(page.locator('#license-dialog')).toBeVisible();
  await page.locator('#license-token').fill('returned-license');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('#license-status')).toHaveText('Pro is unlocked on this device.');
  await page.keyboard.press('Escape');
  await page.getByRole('radio', { name: /Code/ }).click();
  await expect(page.getByRole('radio', { name: /Code/ })).toHaveAttribute('aria-checked', 'true');
});

test('demo and app segmented controls operate with arrow keys', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Paragraph' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#demo-output')).toContainText('keepQueryString');

  await page.addInitScript(() => {
    localStorage.setItem('sb_license:screen-text-drop', 'fixture-valid-license');
    localStorage.setItem('sb_license:screen-text-drop:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto(appOrigin);
  await page.getByRole('radio', { name: /Paragraph/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /Code/ })).toHaveAttribute('aria-checked', 'true');
});

test('navigation and footer links meet the 44 by 44 pixel target baseline', async ({ page }) => {
  for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
    await page.goto(path);
    const targets = page.locator('.site-header a, footer a');
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      if (!box) continue;
      expect(box.height, `${path} link ${index} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${path} link ${index} width`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('reduced motion removes transitions and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const values = await page.evaluate(() => ({
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    transition: getComputedStyle(document.querySelector<HTMLElement>('.download-button')!).transitionDuration,
  }));
  expect(values.scroll).toBe('auto');
  expect(values.transition).toBe('0s');
});
