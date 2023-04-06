import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.js'),
      name: 'svelte-confetti',
      // the proper extensions will be added
      fileName: 'svelte-confetti',
    }
  },
  plugins: [svelte()],
})
