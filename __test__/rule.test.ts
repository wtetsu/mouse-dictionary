import rule from "../src/main/core/rule";

import fs from "fs";

beforeAll(() => {
  define("chrome.extension.getURL", (name) => name);
  define("fetch", async (file) => {
    const data = fs.readFileSync(file);
    return {
      json: () => {
        return JSON.parse(data.toString());
      },
    };
  });
});

const define = (path, data) => {
  const names = path.split(".");

  let current = global;

  for (let i = 0; i < names.length - 1; i++) {
    const n = names[i];
    if (current[n] === undefined) {
      current[n] = {};
    }
    current = current[n];
  }

  const lastIndex = names[names.length - 1];
  if (current[lastIndex] === undefined) {
    current[lastIndex] = data;
  }
};

test("consecutive load", async () => {
  const testRuleData = "__test__/rule.dummy.json";

  const NUM = 100;
  const promiseList = [];
  for (let i = 0; i < NUM; i++) {
    const newPromise = rule.load(testRuleData);
    promiseList.push(newPromise);
  }

  for (let i = 0; i < NUM - 1; i++) {
    const data1 = await promiseList[i];
    const data2 = await promiseList[i + 1];
    expect(data1 === data2).toBeTruthy();
  }
});
