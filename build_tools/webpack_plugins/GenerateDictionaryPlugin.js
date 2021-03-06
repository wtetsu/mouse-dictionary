/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const fs = require("fs");
const path = require("path");
const json5 = require("json5");
const glob = require("fast-glob");

class GenerateDictionaryPlugin {
  constructor(options = []) {
    this.options = options;
  }

  apply(compiler) {
    const outputPath = compiler.options.output.path;

    compiler.hooks.afterEmit.tap("GenerateDictionaryPlugin", () => {
      applyOption(this.options, outputPath);
    });
  }
}

const applyOption = (options, outputDirPath) => {
  const data = uniteJsonFiles(options.from);

  const keys = Object.keys(data);
  keys.sort();

  const unit = (keys.length * 1.0) / options.split;
  let nextThreshold = unit;

  let outData = {};

  const outFiles = [];
  for (let i = 1; i <= keys.length; i++) {
    const key = keys[i];
    outData[key] = data[key];
    if (i >= nextThreshold || i == keys.length) {
      const outJson = JSON.stringify(outData);
      const outFileName = `/${options.to}${outFiles.length}.json`;
      fs.writeFileSync(path.join(outputDirPath, outFileName), outJson, "utf-8");

      outData = {};
      outFiles.push(outFileName);
      nextThreshold += unit;
    }
  }

  const distInformation = { files: outFiles };
  const outputFilePath = path.join(outputDirPath, `${options.to}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(distInformation), "utf-8");
};

const uniteJsonFiles = (fileGlobList) => {
  const resultData = {};
  for (const fileGlob of fileGlobList) {
    for (const entry of glob.sync(fileGlob)) {
      const json = fs.readFileSync(entry, "utf-8");
      const data = json5.parse(json);
      Object.assign(resultData, data);
    }
  }
  return resultData;
};

module.exports = GenerateDictionaryPlugin;
