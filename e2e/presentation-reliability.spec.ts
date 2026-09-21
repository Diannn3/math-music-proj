import { expect, test } from '@playwright/test';

test('numeric presentation hotkeys seek canonical macro chapters', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Presentation keyboard behavior is exercised once in Chromium.');

  await page.goto('/');
  await page.getByRole('button', { name: /Begin raw sonification/ }).click();
  await page.getByRole('button', { name: 'Pause' }).click();

  await expect(page.getByRole('button', { name: 'Fullscreen' })).toBeVisible();

  await page.locator('.view-switch').getByRole('button', { name: 'Instrument', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-bifurcate-shortcuts-ready', 'true');

  // The focused Instrument button deliberately remains focused. Numeric chapter
  // shortcuts are safe from non-text controls and should still work in a live demo.
  await page.keyboard.press('6');

  await expect(page.locator('.state-grid > div').nth(0).locator('strong')).toHaveText('VI. Island');
  await expect(page.locator('.state-grid > div').nth(1).locator('strong')).toHaveText('3.8300');
  await expect(page.locator('.state-grid > div').nth(3).locator('strong')).toHaveText('3');

  await page.keyboard.press('4');
  await expect(page.locator('.state-grid > div').nth(0).locator('strong')).toHaveText('IV. Cascade');
  await expect(page.locator('.state-grid > div').nth(1).locator('strong')).toHaveText('3.5500');
});

test('playback requests and releases a screen wake lock when supported', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Wake Lock integration is exercised once in Chromium.');

  await page.addInitScript(() => {
    const state = {
      requests: 0,
      releases: 0,
    };

    Object.defineProperty(window, '__bifurcateWakeLockState', {
      configurable: true,
      value: state,
    });

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: async (type: string) => {
          if (type !== 'screen') throw new Error('unexpected wake-lock type');
          state.requests += 1;

          const listeners = new Set<() => void>();
          let released = false;

          return {
            addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
            release: async () => {
              if (released) return;
              released = true;
              state.releases += 1;
              for (const listener of listeners) listener();
            },
          };
        },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Begin raw sonification/ }).click();

  await expect.poll(
    () => page.evaluate(() => (window as typeof window & {
      __bifurcateWakeLockState: { requests: number };
    }).__bifurcateWakeLockState.requests),
  ).toBeGreaterThanOrEqual(1);

  await page.getByRole('button', { name: 'Pause' }).click();

  await expect.poll(
    () => page.evaluate(() => (window as typeof window & {
      __bifurcateWakeLockState: { releases: number };
    }).__bifurcateWakeLockState.releases),
  ).toBeGreaterThanOrEqual(1);
});
