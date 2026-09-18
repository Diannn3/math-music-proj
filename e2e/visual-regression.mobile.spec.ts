import { expect, test } from '@playwright/test';

test('mobile Performance and Instrument layouts match release baselines', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile visual baselines are pinned to Chromium CI.');

  await page.goto('/');
  await expect(page.locator('.plot-status')).toContainText('49,152 orbit points', { timeout: 20_000 });

  const canvas = page.locator('.bifurcation-canvas');

  await expect(page).toHaveScreenshot('performance-mobile.png', {
    fullPage: true,
    animations: 'disabled',
    mask: [canvas],
    maxDiffPixelRatio: 0.015,
  });

  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('.state-grid')).toBeVisible();

  await expect(page).toHaveScreenshot('instrument-mobile.png', {
    fullPage: true,
    animations: 'disabled',
    mask: [canvas],
    maxDiffPixelRatio: 0.015,
  });
});
