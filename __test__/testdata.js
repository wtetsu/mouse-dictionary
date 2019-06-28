import fs from "fs";
import data from "../src/lib/data";

const load = () => {
  data.registerSpelling(readJson("spelling.json"));
  data.registerPossessives(readJson("possessive.json"));
  data.registerVerbs(readJson("verb.json"));
  data.registerNouns(readJson("noun.json"));
  data.registerTrailing(readJson("trailing.json"));
  data.registerPhrase(readJson("phrase.json"));
};

const readJson = fileName => {
  const json = fs.readFileSync(`static/data/rule/${fileName}`, "utf8");
  return JSON.parse(json);
};

export default { load };
