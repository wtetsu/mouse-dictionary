/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Bundle multiple JSON files into a single file.

import fs from "node:fs";
import path from "node:path";
// @ts-expect-error deinja ships no type declarations
import jaRule from "deinja/src/data.js";
import json5 from "json5";

type RuleSource = { name: string; file?: string; data?: unknown };

const DEFAULT_OPTIONS: RuleSource[] = [
  { name: "letters", file: "data/rule/letters.json5" },
  { name: "noun", file: "data/rule/noun.json5" },
  { name: "phrase", file: "data/rule/phrase.json5" },
  { name: "pronoun", file: "data/rule/pronoun.json5" },
  { name: "spelling", file: "data/rule/spelling.json5" },
  { name: "trailing", file: "data/rule/trailing.json5" },
  { name: "verb", file: "data/rule/verb.json5" },
  { name: "ja", data: jaRule },
];
const DEFAULT_OUTPUT_DIR_PATH = "static/gen/data";

const main = (options: RuleSource[], outputDirPath: string) => {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  const outputPath = path.join(outputDirPath, "rule.json");
  const skip = fs.existsSync(outputPath) && !force;
  if (skip) {
    console.info(`⏭️ Skipped(Already exists): ${outputPath}`);
    return;
  }

  generateJaRule(options, outputPath);
};

const generateJaRule = (options: RuleSource[], outputPath: string) => {
  const data = uniteJsonFiles(options);
  const unitedJson = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, unitedJson, "utf-8");
  console.info(`✅ Generated: ${outputPath}`);
};

const uniteJsonFiles = (options: RuleSource[]) => {
  const resultData: Record<string, unknown> = {};
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

if (import.meta.main) {
  main(DEFAULT_OPTIONS, DEFAULT_OUTPUT_DIR_PATH);
}
