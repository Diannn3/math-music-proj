import { performance } from 'node:perf_hooks';
import { expect, test } from '@playwright/test';
import { RELEASE_PERFORMANCE_BUDGETS } from '../src/performance/budgets';

test('desktop release performance stays inside explicit CI budgets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Performance budget is calibrated to Chromium CI.');

  const budget = RELEASE_PERFORMANCE_BUDGETS.desktop;

  const start = performance.now();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  const headingMs = performance.now() - start;
  expect(headingMs).toBeLessThan(budget.headingVisibleMs);

  await expect(page.locator('.plot-status')).toContainText('orbit points', {
    timeout: budget.orbitFieldReadyMs,
  });
  const plotMs = performance.now() - start;
  expect(plotMs).toBeLessThan(budget.orbitFieldReadyMs);

  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await expect(page.locator('.stage-readout .mode-chip')).toContainText('RAW');
  await page.getByRole('button', { name: 'Pause' }).click();

  const switchStart = performance.now();
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('.transport-panel')).toBeVisible();
  expect(performance.now() - switchStart).toBeLessThan(budget.instrumentSwitchMs);

  await page.getByRole('button', { name: /Explore choose r/ }).click();
  const explore = page.getByRole('region', { name: 'Explore logistic-map parameter' });
  await expect(explore).toBeVisible();

  const portraitStart = performance.now();
  await explore.locator('.explore-presets button').filter({ hasText: '3.720' }).click();
  await expect(explore.locator('.explore-metrics > div').nth(0).locator('strong')).toHaveText('chaotic');
  expect(performance.now() - portraitStart).toBeLessThan(budget.explorePortraitMs);
});
