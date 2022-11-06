/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Bundle multiple JSON files into a single file.

const fs = require("fs");
const path = require("path");
const json5 = require("json5");
const jaRule = require("deinja/src/data");

const main = (options, outputPath) => {
  const data = uniteJsonFiles(options);
  const unitedJson = JSON.stringify(data);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, unitedJson, "utf-8");
  console.info(`Generated: ${outputPath}`);
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

main(
  [
    { name: "letters", file: "data/rule/letters.json5" },
    { name: "noun", file: "data/rule/noun.json5" },
    { name: "phrase", file: "data/rule/phrase.json5" },
    { name: "pronoun", file: "data/rule/pronoun.json5" },
    { name: "spelling", file: "data/rule/spelling.json5" },
    { name: "trailing", file: "data/rule/trailing.json5" },
    { name: "verb", file: "data/rule/verb.json5" },
    { name: "ja", data: jaRule },
  ],
  "static/gen/data/rule.json"
);
