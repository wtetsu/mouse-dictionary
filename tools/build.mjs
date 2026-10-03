/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Build with Vite (Rolldown).

import path from "node:path";
import fse from "fs-extra";
import { build } from "vite";

const { version } = fse.readJsonSync("package.json");
const settings = fse.readJsonSync("tools/build.json");

const main = async (browser, mode, watchMode) => {
  copyStaticFiles(browser, mode);

  for (const [entry, outfile] of Object.entries(settings.entries)) {
    await buildEntry(browser, mode, watchMode, entry, outfile);
  }
};

const copyStaticFiles = (browser, mode) => {
  const sourceDirs = ["base", "gen", `gen-${browser}`, "pdf"];
  if (mode !== "production") {
    sourceDirs.push("overwrite");
  }
  for (const sourceDir of sourceDirs) {
    fse.copySync(`static/${sourceDir}`, `dist-${browser}`, {
      overwrite: true,
      filter: (f) => !f.startsWith("."),
    });
  }
  fse.copyFileSync("node_modules/milligram/dist/milligram.min.css", `dist-${browser}/options/milligram.min.css`);
};

const buildEntry = async (browser, mode, watchMode, entry, outfile) => {
  const outPath = path.join(`dist-${browser}`, outfile);
  const result = await build(createConfig(browser, mode, watchMode, entry, outfile));

  if (!watchMode) {
    console.info(`✅ Generated: ${outPath}`);
    return;
  }

  result.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      console.info(`[${getTime()}]✅ Generated: ${outPath}`);
      event.result?.close();
    } else if (event.code === "ERROR") {
      console.error(event.error);
      event.result?.close();
    }
  });
};

const createConfig = (browser, mode, watchMode, entry, outfile) => {
  const isProd = mode === "production";
  return {
    configFile: false,
    publicDir: false,
    logLevel: "warn",
    mode,
    define: {
      BROWSER: JSON.stringify(browser),
      DIALOG_ID: JSON.stringify(`____MOUSE_DICTIONARY_6FQSXRIXUKBSIBEF_${version}`),
      MODE: JSON.stringify(mode),
      DEBUG: JSON.stringify(isProd ? "" : "true"),
      VERSION: JSON.stringify(version),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    build: {
      outDir: `dist-${browser}`,
      emptyOutDir: false,
      copyPublicDir: false,
      target: settings.targets[browser],
      minify: isProd,
      sourcemap: isProd ? false : "inline",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      watch: watchMode ? {} : null,
      // Each entry must be a single self-contained classic script (content script / service worker / options page)
      rolldownOptions: {
        input: entry,
        output: {
          format: "iife",
          strict: true,
          entryFileNames: outfile,
        },
      },
    },
  };
};

const getTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

if (process.argv.length <= 3) {
  console.error("Usage: node build.mjs browser mode");
  process.exit(1);
}

const browser = process.argv[2];
const mode = process.argv[3];
const watch = process.argv[4];

if (mode !== "development" && mode !== "production") {
  throw new Error(`Invalid mode: ${mode}`);
}

main(browser, mode, watch).catch((e) => {
  console.error(e);
  process.exit(1);
});
