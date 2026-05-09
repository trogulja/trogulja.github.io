// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://trogulja.github.io',
  markdown: {
    smartypants: false,
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
      defaultColor: 'dark',
    },
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [mdx(), sitemap()]
});