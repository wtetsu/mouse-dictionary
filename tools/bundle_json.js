/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Bundle multiple JSON files into a single file.

const fs = require("node:fs");
const path = require("node:path");
const json5 = require("json5");
const jaRule = require("deinja/src/data");

const DEFAULT_OPTIONS = [
  { name: "letters", file: "data/rule/letters.json5" },
  { name: "noun", file: "data/rule/noun.json5" },
  { name: "phrase", file: "data/rule/phrase.json5" },
  { name: "pronoun", file: "data/rule/pronoun.json5" },
  { name: "spelling", file: "data/rule/spelling.json5" },
  { name: "trailing", file: "data/rule/trailing.json5" },
  { name: "verb", file: "data/rule/verb.json5" },
  { name: "ja", data: jaRule },
]
const DEFAULT_OUTPUT_PATH = "static/gen/data/rule.json";

const main = (options, outputPath) => {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  const skip = fs.existsSync(outputPath) && !force;
  if (skip) {
    console.info(`Skipped(Already exists): ${outputPath}`);
    return;
  }

  generateJaRule(options, outputPath);
};

const generateJaRule = (options, outputPath) => {
  const data = uniteJsonFiles(options);
  const unitedJson = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, unitedJson, "utf-8");
  console.info(`Generated: ${outputPath}`);
};

const uniteJsonFiles = (options) => {
  const resultData = {};
  for (const option of options) {
    if (option.data) {
      resultData[option.name] = option.data;
      continue;
    }
    if (option.file) {
      const json = fs.readFileSync(option.file, "utf-8");
      resultData[option.name] = json5.parse(json);
    }
  }
  return resultData;
};

if (require.main === module) {
  main(DEFAULT_OPTIONS, DEFAULT_OUTPUT_PATH);
}
