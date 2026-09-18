import { expect, test } from '@playwright/test';

test('interpretation guide explains the mathematical and artistic layers', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Accessibility semantics are exercised once in Chromium.');

  await page.goto('/');

  const help = page.getByRole('button', { name: 'How to read this' });
  await expect(help).toHaveAttribute('aria-expanded', 'false');

  await help.focus();
  await page.keyboard.press('Enter');

  await expect(help).toHaveAttribute('aria-expanded', 'true');
  const guide = page.locator('.interpretation-guide');
  await expect(guide).toBeVisible();
  await expect(guide.getByRole('heading', { name: /picture and the sound are the same mathematical events/i })).toBeVisible();
  await expect(guide.getByText(/scale, instrumentation, and arrangement are compositional choices/i)).toBeVisible();
  await expect(guide.getByText('Space')).toBeVisible();
  await expect(guide.getByText('play / pause')).toBeVisible();

  await guide.getByRole('button', { name: 'Close interpretation guide' }).click();
  await expect(guide).toHaveCount(0);
  await expect(help).toHaveAttribute('aria-expanded', 'false');
});

test('question-mark shortcut toggles the interpretation guide', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Keyboard shortcut semantics are exercised once in Chromium.');

  await page.goto('/');
  await page.keyboard.press('?');
  await expect(page.locator('.interpretation-guide')).toBeVisible();
  await page.keyboard.press('?');
  await expect(page.locator('.interpretation-guide')).toHaveCount(0);
});

test('playback exposes a semantic progressbar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Progress semantics are exercised once in Chromium.');

  await page.goto('/');
  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();

  const progress = page.getByRole('progressbar', { name: 'Playback progress' });
  await expect(progress).toHaveAttribute('aria-valuemin', '0');
  await expect(progress).toHaveAttribute('aria-valuemax', '100');
  await expect(progress).toHaveAttribute('aria-valuenow', /\d+/);
  await expect(progress).toHaveAttribute('aria-valuetext', /of/);
});

test('reduced motion suppresses decorative CSS motion and keeps the plot usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Reduced-motion behavior is exercised once in Chromium.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.plot-status')).toContainText('orbit points', { timeout: 30_000 });

  const transitionDuration = await page.locator('.active-r-line').evaluate((node) => {
    return getComputedStyle(node).transitionDuration;
  });
  expect(['0s', '0.001ms']).toContain(transitionDuration);

  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await expect(page.locator('.stage-readout')).toBeVisible();
});
