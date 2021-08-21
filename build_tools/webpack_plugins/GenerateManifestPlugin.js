/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const fs = require("fs");
const path = require("path");

class GenerateManifestPlugin {
  constructor(options = []) {
    this.options = options;
  }

  apply(compiler) {
    const outputPath = compiler.options.output.path;
    compiler.hooks.afterEmit.tap("GenerateManifestPlugin", () => {
      applyOption(this.options, outputPath);
    });
  }
}

const applyOption = (options, outputDirPath) => {
  const manifest = readJsonFile(options.from);

  if (options.debug) {
    manifest.name += " (Debug)";
    const debugConfig = getDebugConfigFileName(options.from);
    if (fs.existsSync(debugConfig)) {
      Object.assign(manifest, readJsonFile(debugConfig));
    }
  }

  if (options.overwrite) {
    Object.assign(manifest, options.overwrite);
  }

  const outputFilePath = path.join(outputDirPath, `${options.to}`);
  fs.writeFileSync(outputFilePath, JSON.stringify(manifest, null, 2), "utf-8");
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

module.exports = GenerateManifestPlugin;
