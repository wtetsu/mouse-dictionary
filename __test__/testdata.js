import fs from "fs";
import data from "../src/lib/data";

const load = () => {
  data.registerSpelling(readJson("spelling.json"));
  data.registerPossessives(readJson("possessives.json"));
  data.registerVerbs(readJson("verbs.json"));
  data.registerNouns(readJson("nouns.json"));
  data.registerTrailing(readJson("trailing.json"));
  data.registerPhrase(readJson("phrase.json"));
};

const readJson = fileName => {
  const json = fs.readFileSync(`static/data/${fileName}`, "utf8");
  return JSON.parse(json);
};

export default { load };
