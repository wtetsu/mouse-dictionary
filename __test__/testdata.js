import fs from "fs";
import json5 from "json5";
import rule from "../src/main/rule";

const load = () => {
  rule.registerNoun(readJson("noun.json5"));
  rule.registerPhrase(readJson("phrase.json5"));
  rule.registerPronoun(readJson("pronoun.json5"));
  rule.registerSpelling(readJson("spelling.json5"));
  rule.registerTrailing(readJson("trailing.json5"));
  rule.registerVerb(readJson("verb.json5"));
};

const readJson = fileName => {
  const json = fs.readFileSync(`rule/${fileName}`, "utf8");
  return json5.parse(json);
};

export default { load };
