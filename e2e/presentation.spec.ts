import { expect, test } from '@playwright/test';

test('presenter mode opens privately and jumps to canonical cues', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Presenter workflow is exercised once in Chromium.');

  await page.goto('/?presenter=1');
  await expect(page.locator('html')).toHaveAttribute('data-bifurcate-shortcuts-ready', 'true');

  const panel = page.getByRole('complementary', { name: 'Presenter cue sheet' });
  await expect(panel).toBeVisible();
  await expect(panel.getByText('One equation, one attractor')).toBeVisible();

  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await page.getByRole('button', { name: 'Pause' }).click();

  await panel.getByRole('button', { name: /Order returns inside chaos/ }).click();
  await expect(panel.getByText('Order returns inside chaos')).toBeVisible();
  await expect(panel.getByText('r = 3.8300')).toBeVisible();
  await expect(panel.getByText(/Next at 3:00 · Chaos returns/)).toBeVisible();

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', bubbles: true }));
  });
  await expect(panel).toHaveCount(0);
});

test('release manifest downloads with canonical hashes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Submission export is exercised once in Chromium.');

  await page.goto('/');
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await page.getByRole('button', { name: /Export JSON \+ MIDI/ }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Release manifest/ }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('BIFURCATE-release-manifest.json');
  const path = await download.path();
  expect(path).not.toBeNull();

  const text = await import('node:fs/promises').then(({ readFile }) => readFile(path!, 'utf8'));
  const manifest = JSON.parse(text);

  expect(manifest.schema).toBe('bifurcate.release-manifest.v1');
  expect(manifest.canonicalScore).toMatchObject({
    bars: 92,
    durationSeconds: 230,
    primaryEventCount: 736,
  });

  const sha256 = /^[a-f0-9]{64}$/;
  for (const hash of Object.values(manifest.releaseAssets)) {
    expect(hash).toMatch(sha256);
  }
});
