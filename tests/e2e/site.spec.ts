import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page is complete, responsive, and accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Screen Text Drop/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Download for/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Code' }).click();
  await expect(page.locator('#demo-output')).toContainText('capture');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('legal pages have landmarks and one heading', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});
