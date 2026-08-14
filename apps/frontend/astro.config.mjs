import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../.env', import.meta.url), quiet: true });

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  integrations: [
    sitemap({
      filter: (page) => !['/privacy/', '/consent/'].some((path) => new URL(page).pathname === path),
    }),
  ],
});
