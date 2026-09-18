import { expect, test } from '@playwright/test';

test('desktop Performance and Instrument layouts match release baselines', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Visual baselines are pinned to Chromium CI.');

  await page.goto('/');
  await expect(page.locator('.plot-status')).toContainText('orbit points', { timeout: 20_000 });

  const canvas = page.locator('.bifurcation-canvas');

  await expect(page).toHaveScreenshot('performance-desktop.png', {
    fullPage: true,
    animations: 'disabled',
    mask: [canvas],
    maxDiffPixelRatio: 0.01,
  });

  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('.transport-panel')).toBeVisible();

  await expect(page).toHaveScreenshot('instrument-desktop.png', {
    fullPage: true,
    animations: 'disabled',
    mask: [canvas],
    maxDiffPixelRatio: 0.01,
  });
});
