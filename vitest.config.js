import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import path from 'path'

export default defineConfig({
  plugins: [svelte({hot: !process.env.VITEST}), svelteTesting()],
  resolve: {
    alias: {
      // these are the aliases and paths available throughout the app
      // they are also needed here for scripts outside SvelteKit (e.g. tests)
      $lib: path.resolve('./src/lib'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
})
