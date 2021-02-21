/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const fs = require("fs");
const path = require("path");
const json5 = require("json5");

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

  mkdir(path.dirname(outputFilePath));
  fs.writeFileSync(outputFilePath, unitedJson, "utf-8");
};

const uniteJsonFiles = (options) => {
  const resultData = {};
  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    let data = null;
    if (option.data) {
      data = option.data;
    } else if (option.file) {
      const json = fs.readFileSync(option.file, "utf-8");
      data = json5.parse(json);
    }
    if (data) {
      resultData[option.name] = data;
    }
  }
  return resultData;
};

const mkdir = (path) => {
  if (fs.existsSync(path)) {
    return;
  }
  fs.mkdirSync(path, true);
};

module.exports = UniteJsonPlugin;
