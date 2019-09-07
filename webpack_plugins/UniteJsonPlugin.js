/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const fs = require("fs");
const path = require("path");

class UniteJsonPlugin {
  constructor(options = []) {
    if (!Array.isArray(options)) {
      throw new Error("[unite-json-plugin] options must be an array");
    }
    this.options = options;
  }

  apply(compiler) {
    const outputPath = compiler.options.output.path;

    compiler.hooks.afterEmit.tap("UniteJsonPlugin", () => {
      for (let i = 0; i < this.options.length; i++) {
        applyOption(this.options[i], outputPath);
      }
    });
  }
}

const applyOption = (option, outputDirPath) => {
  const data = uniteJsonFiles(option.from);
  const unitedJson = JSON.stringify(data);

  const outputFilePath = path.join(outputDirPath, option.to);
  fs.writeFileSync(outputFilePath, unitedJson, "utf-8");
};

const uniteJsonFiles = options => {
  const resultData = {};
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const json = fs.readFileSync(option.file, "utf-8");
    const data = JSON.parse(json);
    resultData[option.name] = data;
  }
  return resultData;
};

module.exports = UniteJsonPlugin;
