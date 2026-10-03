/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Build with Vite (Rolldown).

import fs from "node:fs";
import path from "node:path";
import { build, type InlineConfig } from "vite";
import pkg from "../package.json" with { type: "json" };
import settings from "./build.json" with { type: "json" };

const { version } = pkg;

type Browser = keyof typeof settings.targets;
type Mode = "development" | "production";

const main = async (browser: Browser, mode: Mode, watchMode: string | undefined) => {
  copyStaticFiles(browser, mode);

  for (const [entry, outfile] of Object.entries(settings.entries)) {
    await buildEntry(browser, mode, watchMode, entry, outfile);
  }
};

const copyStaticFiles = (browser: Browser, mode: Mode) => {
  const sourceDirs = ["base", "gen", `gen-${browser}`, "pdf"];
  if (mode !== "production") {
    sourceDirs.push("overwrite");
  }
  for (const sourceDir of sourceDirs) {
    fs.cpSync(`static/${sourceDir}`, `dist-${browser}`, {
      recursive: true,
      filter: (f) => !path.basename(f).startsWith("."),
    });
  }
  fs.copyFileSync("node_modules/milligram/dist/milligram.min.css", `dist-${browser}/options/milligram.min.css`);
};

const buildEntry = async (
  browser: Browser,
  mode: Mode,
  watchMode: string | undefined,
  entry: string,
  outfile: string,
) => {
  const outPath = path.join(`dist-${browser}`, outfile);
  const result = await build(createConfig(browser, mode, watchMode, entry, outfile));

  if (!watchMode || !("on" in result)) {
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

const createConfig = (
  browser: Browser,
  mode: Mode,
  watchMode: string | undefined,
  entry: string,
  outfile: string,
): InlineConfig => {
  const isProd = mode === "production";
  return {
    configFile: false,
    publicDir: false,
    logLevel: "warn",
    mode,
    define: {
      BROWSER: JSON.stringify(browser),
      DIALOG_ID: JSON.stringify(`____MOUSE_DICTIONARY_6FQSXRIXUKBSIBEF_${version}`),
      DEBUG: JSON.stringify(!isProd),
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

const isBrowser = (browser: string): browser is Browser => Object.hasOwn(settings.targets, browser);

const getTime = () => Temporal.Now.plainDateTimeISO().toString({ smallestUnit: "second" }).replace("T", " ");

if (process.argv.length <= 3) {
  console.error("Usage: node build.ts browser mode");
  process.exit(1);
}

const browser = process.argv[2];
const mode = process.argv[3];
const watch = process.argv[4];

if (!isBrowser(browser)) {
  throw new Error(`Invalid browser: ${browser}`);
}
if (mode !== "development" && mode !== "production") {
  throw new Error(`Invalid mode: ${mode}`);
}

main(browser, mode, watch).catch((e) => {
  console.error(e);
  process.exit(1);
});
