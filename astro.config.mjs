import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://bifurcate-math-music.vercel.app',
  integrations: [react()],
  vite: {
    build: {
      target: 'es2022',
    },
  },
});
