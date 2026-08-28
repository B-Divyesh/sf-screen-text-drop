import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page is complete, responsive, and accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/turn a screen region into text/i);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Try it with sample data/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Download for/i })).toBeVisible();
  await page.getByRole('link', { name: /Try it with sample data/i }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  // axe-core currently types against a newer Playwright Page; runtime APIs are compatible.
  if (test.info().project.name === 'desktop') {
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('legal pages have landmarks, complete route metadata, and one heading', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
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
  await page.goto('/demo/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:screen-text-drop:sample'))).not.toBeNull();
  await expect(page.evaluate(() => localStorage.getItem('sb_license:screen-text-drop'))).resolves.toBeNull();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-output')).toContainText('route parser');
  await expect(page.evaluate(() => localStorage.getItem('sb_license:screen-text-drop'))).resolves.toBeNull();
});

test('@claim:demo-offline', async ({ page, context }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in the desktop demo sandbox.');
  await page.goto('/demo/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Try a text drop/i })).toBeVisible();
  await expect(page.locator('#demo-output')).toContainText('route parser');
  await context.setOffline(false);
});

test('@claim:demo-local-network', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Claim flows run once in the desktop demo sandbox.');
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Table' }).click();
  await expect(page.locator('#demo-output')).toContainText('Support link');
  expect(urls.every((value) => new URL(value).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:desktop-sample', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'The desktop app is not a mobile product surface.');
  await page.goto('http://127.0.0.1:1420');
  await page.getByRole('button', { name: 'Load sample project' }).click();
  await expect(page.locator('#result')).toHaveValue(/route parser strips the utm_source/);
  await expect(page.locator('#live')).toContainText('Sample project loaded');
});

test('navigation and legal links meet the 44px target baseline', async ({ page }) => {
  await page.goto('/');
  const targets = page.locator('.site-header a, footer a');
  for (let index = 0; index < await targets.count(); index += 1) {
    const box = await targets.nth(index).boundingBox();
    if (!box) continue;
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
