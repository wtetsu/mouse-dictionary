/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Build with esbuild.

const path = require("node:path");
const esbuild = require("esbuild");
const fse = require("fs-extra");
const version = require("../package.json").version;

const settings = require("./build.json");


const main = async (browser, mode, watchMode) => {
  copyStaticFiles(browser, mode);

  if (watchMode) {
    watch(browser, mode);
  } else {
    build(browser, mode);
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

const build = (browser, mode) => {
  const ioList = createIoList(browser);
  const options = createOptions(browser, mode);

  for (const io of ioList) {
    esbuild
      .build({
        ...options,
        ...io,
      })
      .catch(() => process.exit(1));
    console.info(`✅ Generated: ${io.outfile}`);
  }
};

const watch = async (browser, mode) => {
  asyncs = [];
  const ioList = createIoList(browser);
  const options = createOptions(browser, mode);

  for (const io of ioList) {
    const ctx = await esbuild
      .context({
        bundle: true,
        ...options,
        ...io,
        plugins: [
          {
            name: "on-end",
            setup(build) {
              build.onEnd((result) => {
                if (result.errors.length === 0) {
                  console.info(`[${getTime()}]✅ Generated: ${io.outfile}`);
                }
              });
            },
          },
        ],
      })
      .catch(() => process.exit(1));

    asyncs.push(ctx.watch());
  }

  return asyncs;
};

const createIoList = (browser) => {
  return Object.keys(settings.entries).map((key) => {
    return {
      entryPoints: [key],
      outfile: path.join(`dist-${browser}`, settings.entries[key]),
    };
  });
};

const createOptions = (browser, mode) => {
  const isProd = mode === "production";
  return {
    bundle: true,
    define: {
      BROWSER: JSON.stringify(browser),
      DIALOG_ID: JSON.stringify(`____MOUSE_DICTIONARY_6FQSXRIXUKBSIBEF_${version}`),
      MODE: JSON.stringify(mode),
      DEBUG: JSON.stringify(isProd ? "" : "true"),
    },
    minify: isProd,
    sourcemap: isProd ? undefined : "inline",
    target: settings.targets[browser],
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

if (require.main === module) {
  if (process.argv.length <= 3) {
    console.error("Usage: node build.js browser mode");
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
