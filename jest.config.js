export default {
  roots: [
    "test"
  ],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.svelte$": "svelte-jest"
  },
  moduleFileExtensions: [
    "js",
    "svelte"
  ],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"]
}
