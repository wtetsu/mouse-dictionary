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
  const manifest = {};
  for (const sourceFile of options.from) {
    Object.assign(manifest, readJsonFile(sourceFile));
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

module.exports = GenerateManifestPlugin;
