import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "native",
          include: ["src/**/*.test.ts", "src/**/*.test.js"],
          exclude: [...configDefaults.exclude, "src/docs-site.test.js"],
          // Native game tests need the existing server-side word-list loader.
          setupFiles: ["./src/words.ts"],
          testTimeout: 60_000,
          sequence: { groupOrder: 0 },
        },
      },
      {
        test: {
          name: "documentation",
          include: ["src/docs-site.test.js"],
          // Measure after the native workers finish: the full-suite concurrent
          // measurement differed from both the CLI and the isolated measurement.
          testTimeout: 60_000,
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
