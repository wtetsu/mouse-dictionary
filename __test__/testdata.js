import fs from "fs";
import rule from "../src/main/rule";

const load = () => {
  rule.registerNoun(readJson("noun.json"));
  rule.registerPhrase(readJson("phrase.json"));
  rule.registerPronoun(readJson("pronoun.json"));
  rule.registerSpelling(readJson("spelling.json"));
  rule.registerTrailing(readJson("trailing.json"));
  rule.registerVerb(readJson("verb.json"));
};

const readJson = fileName => {
  const json = fs.readFileSync(`static/data/rule/${fileName}`, "utf8");
  return JSON.parse(json);
};

export default { load };
