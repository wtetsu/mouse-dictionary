/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Make dictionary data and metadata.

import fs from "node:fs";
import path from "node:path";
import json5 from "json5";

type DictOptions = { from: string[]; to: string; split: number };

const main = (options: DictOptions, outputDirPath: string) => {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  const skip = allFilesExist(options.to, options.split, outputDirPath) && !force;
  if (skip) {
    const outPath = path.join(outputDirPath, `${options.to}.json`);
    console.info(`⏭️ Skipped(Already exists): ${outPath}`);
    return;
  }

  generateDictData(options, outputDirPath);
};

const generateDictData = (options: DictOptions, outputDirPath: string) => {
  fs.mkdirSync(outputDirPath, { recursive: true });

  const data = uniteJsonFiles(options.from);
  const outFilePaths = splitDataAndWrite(data, options.split, options.to, outputDirPath);

  const distInformation = { files: outFilePaths };
  const outputFilePath = path.join(outputDirPath, `${options.to}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(distInformation), "utf-8");
  console.info(`✅ Generated: ${outputFilePath}`);
};

const splitDataAndWrite = (data: Record<string, unknown>, split: number, to: string, outputDirPath: string) => {
  const keys = Object.keys(data);
  keys.sort();
  const unit = (keys.length * 1.0) / split;

  let nextThreshold = unit;
  let outData: Record<string, unknown> = {};

  const outFiles: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    outData[key] = data[key];
    if (i + 1 >= nextThreshold || i === keys.length - 1) {
      const outJson = JSON.stringify(outData);
      const outFileName = `/${to}${outFiles.length}.json`;
      const outPath = path.join(outputDirPath, outFileName);
      fs.writeFileSync(outPath, outJson, "utf-8");
      console.info(`✅ Generated: ${outPath}`);

      outData = {};
      outFiles.push(outFileName);
      nextThreshold += unit;
    }
  }
  return outFiles;
};

const allFilesExist = (to: string, split: number, outputDirPath: string) => {
  if (!fs.existsSync(path.join(outputDirPath, `${to}.json`))) {
    return false;
  }

  for (let i = 0; i < split; i++) {
    const outPath = path.join(outputDirPath, `${to}${i}.json`);
    if (!fs.existsSync(outPath)) {
      return false;
    }
  }
  return true;
};

const uniteJsonFiles = (fileGlobList: string[]) => {
  const resultData: Record<string, unknown> = {};
  for (const fileGlob of fileGlobList) {
    for (const entry of fs.globSync(fileGlob)) {
      const json = fs.readFileSync(entry, "utf-8");
      const data = json5.parse(json);
      Object.assign(resultData, data);
    }
  }
  return resultData;
};

if (import.meta.main) {
  main(
    {
      from: ["data/dict/[a-z].json5"],
      to: "data/dict",
      split: 10,
    },
    "static/gen",
  );
}
