import path from "path"
import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: "happy-dom",
		include: ["src/**/*.{test,spec}.{js,ts}"],
		setupFiles: ["src/test.setup.js"]
	},

	resolve: {
		conditions: process.env.VITEST ? ["browser"] : [],
    alias: {
      "$lib": path.resolve(__dirname, "./src/lib")
		}
	}
})
