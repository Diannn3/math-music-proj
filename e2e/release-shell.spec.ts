import { expect, test } from '@playwright/test';

test('release metadata and generated social assets are valid', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Release metadata verification is pinned to Chromium CI.');

  await page.goto('/');

  await expect(page).toHaveTitle('BIFURCATE — Hearing the Logistic Map');

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBe('https://bifurcate-math-music.vercel.app/');

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'BIFURCATE — Hearing the Logistic Map',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://bifurcate-math-music.vercel.app/og-bifurcate.png',
  );

  const structured = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(structured['@type']).toBe('CreativeWork');
  expect(structured.name).toBe('BIFURCATE — Hearing the Logistic Map');

  const imageResponse = await request.get('/og-bifurcate.png');
  expect(imageResponse.ok()).toBe(true);
  expect(imageResponse.headers()['content-type']).toContain('image/png');
  const image = await imageResponse.body();
  expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);

  const faviconResponse = await request.get('/favicon.svg');
  expect(faviconResponse.ok()).toBe(true);
  expect(await faviconResponse.text()).toContain('<svg');
});

test('static fallback remains meaningful when JavaScript is disabled', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'No-JS release shell is pinned to Chromium CI.');

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.getByRole('main', { name: 'BIFURCATE static fallback' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'BIFURCATE' })).toBeVisible();
  await expect(page.getByText('x[n+1] = r · x[n] · (1 − x[n])')).toBeVisible();
  await expect(page.getByText(/The interactive experience requires JavaScript/)).toBeVisible();
  await expect(page.getByText(/JavaScript is disabled/)).toBeVisible();

  await context.close();
});
