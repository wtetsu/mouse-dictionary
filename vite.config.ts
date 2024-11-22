import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: "./vitest.setup.ts",
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src"],
      exclude: [
        "src/options",
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
