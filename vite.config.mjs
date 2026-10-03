import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./vitest.setup.ts",
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,ts,tsx}"],
      exclude: [
        "src/options/**/*.tsx",
        "src/options/**/index.ts",
        "src/options/**/types.ts",
        "src/options/extern",
        "src/options/resource",
        "src/options/logic/debounce.ts",
        "src/options/logic/dict.ts",
        "src/options/logic/message.ts",
        "src/options/logic/preview.ts",
      ],
      thresholds: {
        statements: 97,
        branches: 94,
        functions: 96,
        lines: 97,
      },
    },
  },
});
