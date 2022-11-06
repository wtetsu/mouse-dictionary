/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Make dictionary data and metadata.

const fs = require("fs");
const path = require("path");
const json5 = require("json5");
const glob = require("fast-glob");

const main = (options, outputDirPath) => {
  fs.mkdirSync(outputDirPath, { recursive: true });

  const data = uniteJsonFiles(options.from);
  const outFilePaths = splitDataAndWrite(data, options.split, options.to, outputDirPath);

  const distInformation = { files: outFilePaths };
  const outputFilePath = path.join(outputDirPath, `${options.to}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(distInformation), "utf-8");
  console.info(`Generated: ${outputFilePath}`);
};

const splitDataAndWrite = (data, split, to, outputDirPath) => {
  const keys = Object.keys(data);
  keys.sort();
  const unit = (keys.length * 1.0) / split;

  let nextThreshold = unit;
  let outData = {};

  const outFiles = [];
  for (let i = 1; i <= keys.length; i++) {
    const key = keys[i];
    outData[key] = data[key];
    if (i >= nextThreshold || i == keys.length) {
      const outJson = JSON.stringify(outData);
      const outFileName = `/${to}${outFiles.length}.json`;
      const outPath = path.join(outputDirPath, outFileName);
      fs.writeFileSync(outPath, outJson, "utf-8");
      console.info(`Generated: ${outPath}`);

      outData = {};
      outFiles.push(outFileName);
      nextThreshold += unit;
    }
  }
  return outFiles;
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

main(
  {
    from: ["data/dict/[a-z].json5"],
    to: "data/dict",
    split: 10,
  },
  "static/gen/"
);
