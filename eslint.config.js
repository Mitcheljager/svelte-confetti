import prettier from "eslint-config-prettier"
import js from "@eslint/js"
import svelte from "eslint-plugin-svelte"
import globals from "globals"

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...svelte.configs["flat/recommended"],
	prettier,
	...svelte.configs["flat/prettier"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
        PlayPilotLinkInjections: "writable"
			}
		}
	},
	{
		ignores: ["build/", ".svelte-kit/", "dist/"]
	},
	{
		rules: {
			semi: ["error", "never"],
      quotes: ["error", "double"],
			"comma-dangle": ["error", "never"],
			"no-trailing-spaces": ["error"],
			"no-unused-vars": ["error", {
				"vars": "all",
				"args": "after-used",
				"argsIgnorePattern": "[\\w]",
				"caughtErrors": "all",
				"ignoreRestSiblings": false,
				"reportUsedIgnorePattern": false
			}]
		}
	}
]
