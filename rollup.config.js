import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import pkg from "./package.json"

export default [
  	{
		input: "src/Confetti.svelte",
		output: [
			{
				file: pkg.module,
				format: "es"
			},
			{
				file: pkg.main,
				format: "umd",
				name: "Confetti"
			}
		],
		plugins: [
			svelte({
				emitCss: false
			}),
			resolve({
				dedupe: ["svelte"]
			}),
			commonjs()
		]
	},
]
