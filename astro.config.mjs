import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

function normalizeBasePath(value) {
  if (!value || value === '/') return '/';
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig({
  base: normalizeBasePath(process.env.PUBLIC_BASE_PATH),
  integrations: [react()],
  vite: {
    build: {
      target: 'es2022',
    },
  },
});
