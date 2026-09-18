import { expect, test } from '@playwright/test';

test('publishes release metadata and deterministic social artwork', async ({ page, request }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('BIFURCATE — Hearing the Logistic Map');

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /deterministic audiovisual composition/i,
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0f1115');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'BIFURCATE — Hearing the Logistic Map',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /bifurcate-social\.png$/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

  const social = await request.get('/bifurcate-social.png');
  expect(social.ok()).toBe(true);
  expect(social.headers()['content-type']).toContain('image/png');
  const socialBytes = await social.body();
  expect(socialBytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');

  const manifest = await request.get('/site.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).name).toContain('BIFURCATE');
});

test('keeps a complete mathematical fallback when JavaScript is disabled', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'No-JS release fallback is validated once in Chromium.');

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4321/');

  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'One equation. Many behaviors.' })).toBeVisible();
  await expect(page.getByText('736 primary events')).toBeVisible();
  await expect(page.getByText(/JavaScript is disabled/)).toBeVisible();

  const poster = page.locator('.static-fallback__stage img');
  await expect(poster).toHaveAttribute('src', '/bifurcate-poster.png');
  await expect(poster).toHaveAttribute('alt', /logistic-map bifurcation field/i);

  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);

  await context.close();
});
