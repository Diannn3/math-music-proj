import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('external release serves metadata, headers, and static assets', async ({ page, request }) => {
  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response!.ok()).toBe(true);

  const headers = response!.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');

  await expect(page).toHaveTitle('BIFURCATE — Hearing the Logistic Map');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /bifurcate-social\.png$/);

  for (const path of [
    '/bifurcate-social.png',
    '/bifurcate-poster.png',
    '/favicon.svg',
    '/site.webmanifest',
  ]) {
    const asset = await request.get(path);
    expect(asset.ok(), path).toBe(true);
  }

  const social = await request.get('/bifurcate-social.png');
  expect(social.headers()['cache-control']).toContain('max-age=86400');
});

test('external release performs the canonical interaction path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();

  const plotStatus = page.locator('.plot-status');
  await expect(plotStatus).not.toContainText('Building orbit field', { timeout: 30_000 });

  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await expect(page.locator('.stage-readout .mode-chip')).toContainText('RAW');

  await page.getByRole('button', { name: 'Pause' }).click();
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();

  await page.getByRole('button', { name: /Jump to VI\. Island/ }).click();
  await expect(page.locator('.state-grid > div').nth(1).locator('strong')).toHaveText('3.8300');
  await expect(page.locator('.state-grid > div').nth(3).locator('strong')).toHaveText('3');

  await page.getByRole('button', { name: /Explore choose r/ }).click();
  await expect(page.getByRole('region', { name: 'Explore logistic-map parameter' })).toBeVisible();
  await expect(page.locator('.explore-metrics > div').nth(0).locator('strong')).toContainText('period 3');
  await page.getByRole('button', { name: 'Return to piece' }).click();

  expect(errors).toEqual([]);
});

test('external release downloads canonical JSON and MIDI', async ({ page }) => {
  await page.goto('/');
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await page.getByRole('button', { name: /Export JSON \+ MIDI/ }).click();

  const jsonPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Provenance JSON/ }).click();
  const jsonDownload = await jsonPromise;
  const jsonPath = await jsonDownload.path();
  expect(jsonPath).not.toBeNull();

  const document = JSON.parse(await readFile(jsonPath!, 'utf8'));
  expect(document.schema).toBe('bifurcate.provenance.v1');
  expect(document.performance.primaryEventCount).toBe(736);

  const midiPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Musicalized MIDI/ }).click();
  const midiDownload = await midiPromise;
  const midiPath = await midiDownload.path();
  expect(midiPath).not.toBeNull();
  expect((await readFile(midiPath!)).subarray(0, 4).toString('ascii')).toBe('MThd');
});

test('external release retains a useful no-JavaScript fallback', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(process.env.RELEASE_URL!);
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'One equation. Many behaviors.' })).toBeVisible();
  await expect(page.getByText(/JavaScript is disabled/)).toBeVisible();

  await context.close();
});
