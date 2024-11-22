/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Make manifest.json.

const fs = require("node:fs");
const path = require("node:path");
const version = require("../package.json").version;

const main = (options, outputDirPath) => {
  fs.mkdirSync(outputDirPath, { recursive: true });
  const manifest = readJsonFile(options.from);

  if (options.debug) {
    manifest.name += " (Debug)";
    const debugConfig = getDebugConfigFileName(options.from);
    if (fs.existsSync(debugConfig)) {
      Object.assign(manifest, readJsonFile(debugConfig));
    }
  }

  // Workaround assuming Vivaldi (See #84)
  if (manifest?.commands?._execute_action && options.activate_extension_command) {
    const org = manifest.commands._execute_action;
    manifest.commands[options.activate_extension_command] = org;
    delete manifest.commands._execute_action;
  }

  if (options.overwrite) {
    Object.assign(manifest, options.overwrite);
  }

  const outputFilePath = path.join(outputDirPath, `${options.to}`);
  fs.writeFileSync(outputFilePath, JSON.stringify(manifest, null, 2), "utf-8");
  console.info(`Generated: ${outputFilePath}`);
};

const readJsonFile = (sourceJsonFile) => {
  const json = fs.readFileSync(sourceJsonFile, "utf-8");
  return JSON.parse(json);
};

const getDebugConfigFileName = (fileName) => {
  const index = fileName.lastIndexOf(".");
  if (index === -1) {
    return null;
  }

  const baseName = fileName.substring(0, index);
  const ext = fileName.substring(index + 1);
  return `${baseName}-debug.${ext}`;
};

if (require.main === module) {
  if (process.argv.length <= 3) {
    console.error("Usage: node make_manifest.js browser mode");
    process.exit(1);
  }

  const browser = process.argv[2];
  const mode = process.argv[3];
  const activate_extension_command = process.argv.length <= 4 ? "" : process.argv[4];

  if (mode !== "development" && mode !== "production") {
    throw new Error(`Invalid mode: ${mode}`);
  }

  main(
    {
      from: `data/manifest/manifest-${browser}.json`,
      to: "manifest.json",
      overwrite: { version },
      activate_extension_command,
      debug: mode !== "production",
    },
    `static/gen-${browser}/`,
  );
}
