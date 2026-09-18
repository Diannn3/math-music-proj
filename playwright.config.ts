import { defineConfig, devices } from '@playwright/test';

const chromiumLaunch = {
  args: [
    '--enable-webgl',
    '--use-gl=swiftshader',
    '--autoplay-policy=no-user-gesture-required',
  ],
};

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/*.mobile.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: chromiumLaunch,
      },
    },
    {
      name: 'firefox',
      testIgnore: '**/*.mobile.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testIgnore: '**/*.mobile.spec.ts',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chromium',
      testMatch: '**/*.mobile.spec.ts',
      use: {
        ...devices['Pixel 5'],
        launchOptions: chromiumLaunch,
      },
    },
    {
      name: 'mobile-webkit',
      testMatch: '**/*.mobile.spec.ts',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
