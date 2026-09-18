import { performance } from 'node:perf_hooks';
import { expect, test } from '@playwright/test';
import { RELEASE_PERFORMANCE_BUDGETS } from '../src/performance/budgets';

test('mobile release performance stays inside explicit CI budgets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile performance budget is calibrated to Chromium CI.');

  const budget = RELEASE_PERFORMANCE_BUDGETS.mobile;
  const start = performance.now();

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  expect(performance.now() - start).toBeLessThan(budget.headingVisibleMs);

  await expect(page.locator('.plot-status')).toContainText('49,152 orbit points', {
    timeout: budget.orbitFieldReadyMs,
  });
  expect(performance.now() - start).toBeLessThan(budget.orbitFieldReadyMs);

  const switchStart = performance.now();
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('.state-grid')).toBeVisible();
  expect(performance.now() - switchStart).toBeLessThan(budget.instrumentSwitchMs);

  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
});
