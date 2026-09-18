import { defineConfig, devices } from '@playwright/test';

const releaseUrl = process.env.RELEASE_URL;
if (!releaseUrl) throw new Error('RELEASE_URL is required for external deployment verification.');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/external-release.spec.ts',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: releaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'external-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-webgl',
            '--use-gl=swiftshader',
            '--autoplay-policy=no-user-gesture-required',
          ],
        },
      },
    },
  ],
});
