import { expect, test } from '@playwright/test';

test('mobile view stays usable without horizontal overflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  await expect(
    page.locator('.view-switch').getByRole('button', { name: 'Performance', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');

  const status = page.locator('.plot-status');
  await expect(status).not.toContainText('Building orbit field', { timeout: 30_000 });

  const plotStatus = (await status.textContent()) ?? '';
  if (plotStatus.includes('Plot error')) {
    await expect(
      page.getByRole('status').filter({ hasText: 'WebGL bifurcation field unavailable' }),
    ).toBeVisible();
  } else {
    expect(plotStatus).toContain('low');
    expect(plotStatus).toContain('49,152 orbit points');
  }

  const performanceOverflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(performanceOverflow.scrollWidth).toBeLessThanOrEqual(performanceOverflow.innerWidth + 1);

  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('.state-grid')).toBeVisible();
  await expect(page.getByRole('button', { name: /Math Lens/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Explore/ })).toBeVisible();

  const instrumentOverflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(instrumentOverflow.scrollWidth).toBeLessThanOrEqual(instrumentOverflow.innerWidth + 1);
});
