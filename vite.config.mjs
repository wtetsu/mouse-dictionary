import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./vitest.setup.ts",
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src"],
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
        "src/background/background.js",
        "src/main/core/*.js",
        "src/main/lib/ponyfill/*.js",
        "src/main/lib/draggable.js",
        "src/main/lib/edge.js",
        "src/main/lib/ribbon.js",
        "src/main/lib/snap.js",
        "src/main/lib/sound.js",
        "src/main/lib/traverser.js",
        "src/main/start.js",
      ],
    },
  },
});
