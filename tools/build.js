/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Build with esbuild.

const esbuild = require("esbuild");
const fse = require("fs-extra");
const version = require("../package.json").version;

const TARGETS = {
  chrome: ["chrome79"],
  firefox: ["firefox71"],
  safari: ["safari14"],
};

const main = (browser, mode, watch) => {
  copyStaticFiles(browser, mode);
  build(browser, mode, watch);
};

const copyStaticFiles = (browser, mode) => {
  const sourceDirs = ["base", "gen", `gen-${browser}`, "pdf"];
  if (mode != "production") {
    sourceDirs.push("overwrite");
  }
  for (const sourceDir of sourceDirs) {
    fse.copySync(`static/${sourceDir}`, `dist-${browser}`, { overwrite: true });
  }
  fse.copyFileSync("node_modules/milligram/dist/milligram.min.css", `dist-${browser}/options/milligram.min.css`);
};

const build = (browser, mode, watch) => {
  const isProd = mode === "production";
  const options = {
    bundle: true,
    define: {
      BROWSER: JSON.stringify(browser),
      DIALOG_ID: JSON.stringify(`____MOUSE_DICTIONARY_6FQSXRIXUKBSIBEF_${version}`),
      MODE: JSON.stringify(mode),
      DEBUG: !isProd,
    },
    minify: isProd,
    sourcemap: isProd ? undefined : "inline",
    target: TARGETS[browser],
  };

  const inOutList = [
    { entryPoints: ["src/main/start.js"], outfile: `dist-${browser}/main.js` },
    { entryPoints: ["src/options/app.tsx"], outfile: `dist-${browser}/options/options.js` },
    { entryPoints: ["src/background/background.js"], outfile: `dist-${browser}/background.js` },
  ];

  for (const io of inOutList) {
    esbuild
      .build({
        ...options,
        watch: watchConfig(watch, io),
        ...io,
      })
      .catch(() => process.exit(1));
    console.info(`Generated: ${io.outfile}`);
  }
};

const watchConfig = (watch, io) => {
  if (watch !== "watch") {
    return false;
  }
  return {
    onRebuild(error) {
      if (error) {
        console.error("`watch build failed: ${io.outfile}`");
      } else {
        console.log(`watch build succeeded: ${io.outfile}`);
      }
    },
  };
};

if (require.main === module) {
  if (process.argv.length <= 3) {
    console.error(`Usage: node build.js browser mode`);
    process.exit(1);
  }

  const browser = process.argv[2];
  const mode = process.argv[3];
  const watch = process.argv[4];

  if (mode !== "development" && mode !== "production") {
    throw new Error(`Invalid mode: ${mode}`);
  }

  main(browser, mode, watch);
}
