import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

function capturePageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test('boots the production artwork and opens the Math Lens', async ({ page }) => {
  const errors = capturePageErrors(page);

  await page.goto('/');
  await expect(page).toHaveTitle('BIFURCATE — Hearing the Logistic Map');
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  await expect(page.getByText('x[n+1] = r · x[n] · (1 − x[n])')).toBeVisible();

  await expect(page.locator('.plot-status')).toContainText('orbit points', { timeout: 30_000 });
  await expect(page.locator('.plot-status')).not.toContainText('Plot error');

  await page.getByRole('button', { name: /Math Lens/ }).click();
  await expect(page.locator('.math-lens').getByText('COBWEB', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.math-lens').getByText('LYAPUNOV', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/λ < 0 periodic/)).toBeVisible();

  expect(errors).toEqual([]);
});

test('unlocks audio, switches modes, seeks period-3, and enters Explore', async ({ page }) => {
  const errors = capturePageErrors(page);

  await page.goto('/');
  await page.getByRole('button', { name: /Begin raw sonification/ }).click();

  await expect(page.locator('.stage-readout .mode-chip')).toContainText('RAW');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled();
  await page.getByRole('button', { name: 'Pause' }).click();

  const musicalized = page.getByRole('button', { name: /Musicalized D-minor pentatonic/ });
  await musicalized.click();
  await expect(musicalized).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.stage-readout .mode-chip')).toContainText('MUSICALIZED');

  await page.getByRole('button', { name: /Jump to VI\. Island/ }).click();
  await expect(page.locator('.state-grid > div').nth(1).locator('strong')).toHaveText('3.8300');
  await expect(page.locator('.state-grid > div').nth(3).locator('strong')).toHaveText('3');

  await page.getByRole('button', { name: /Explore choose r/ }).click();
  await expect(page.getByRole('region', { name: 'Explore logistic-map parameter' })).toBeVisible();
  await expect(page.locator('.explore-metrics > div').nth(0).locator('strong')).toContainText('period 3');
  await expect(page.locator('.explore-metrics > div').nth(2).locator('strong')).toHaveText('3');

  await page.getByRole('button', { name: 'Return to piece' }).click();
  await expect(page.getByRole('region', { name: 'Explore logistic-map parameter' })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('downloads canonical provenance JSON and musicalized MIDI', async ({ page }) => {
  const errors = capturePageErrors(page);

  await page.goto('/');
  await page.getByRole('button', { name: /Export JSON \+ MIDI/ }).click();
  await expect(page.getByRole('region', { name: 'Export BIFURCATE' })).toBeVisible();

  const jsonDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Provenance JSON/ }).click();
  const jsonDownload = await jsonDownloadPromise;
  expect(jsonDownload.suggestedFilename()).toBe('BIFURCATE-provenance.json');

  const jsonPath = await jsonDownload.path();
  expect(jsonPath).not.toBeNull();
  const document = JSON.parse(await readFile(jsonPath!, 'utf8'));
  expect(document.schema).toBe('bifurcate.provenance.v1');
  expect(document.performance.primaryEventCount).toBe(736);
  expect(document.events).toHaveLength(736);

  const midiDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Musicalized MIDI/ }).click();
  const midiDownload = await midiDownloadPromise;
  expect(midiDownload.suggestedFilename()).toBe('BIFURCATE-musicalized.mid');

  const midiPath = await midiDownload.path();
  expect(midiPath).not.toBeNull();
  const midiBytes = await readFile(midiPath!);
  expect(midiBytes.subarray(0, 4).toString('ascii')).toBe('MThd');
  expect(midiBytes.byteLength).toBeGreaterThan(1000);

  expect(errors).toEqual([]);
});
