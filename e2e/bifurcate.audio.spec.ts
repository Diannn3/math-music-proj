import { expect, test, type Page } from '@playwright/test';

function capturePageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test('renders and validates short RAW and MUSICALIZED WAV excerpts in a real browser', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Release offline-audio diagnostic is pinned to Chromium.');

  test.setTimeout(60_000);
  const errors = capturePageErrors(page);

  await page.goto('/');
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await page.getByRole('button', { name: /Export JSON \+ MIDI/ }).click();

  const panel = page.getByRole('region', { name: 'Export BIFURCATE' });
  await expect(panel).toBeVisible();

  await panel.getByText('Technical audio diagnostic', { exact: true }).click();
  await panel.getByRole('button', { name: 'Run short WAV diagnostic' }).click();

  const results = page.getByLabel('Short WAV diagnostic results');
  await expect(results).toBeVisible({ timeout: 45_000 });
  await expect(results.getByText('RAW PASS')).toBeVisible();
  await expect(results.getByText('MUSICALIZED PASS')).toBeVisible();
  await expect(panel.locator('output')).toContainText(
    'Short RAW + MUSICALIZED offline-render diagnostic passed.',
  );

  const text = await results.textContent();
  expect(text).toContain('2.50 s');
  expect(text).toContain('3.00 s');

  expect(errors).toEqual([]);
});
