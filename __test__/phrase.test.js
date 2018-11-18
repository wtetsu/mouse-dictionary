import phrase from "../src/phrase";

test("3", () => {
  testNormalize(["a", "b", "c"], [["a", "~", "c"], ["a", "c"]]);
});

test("4", () => {
  testNormalize(
    ["a", "b", "c", "d"],
    [["a", "~", "c", "d"], ["a", "b", "~", "d"], ["a", "~", "d"], ["a", "A", "c", "B"], ["a", "d"]]
  );
});

test("5", () => {
  testNormalize(
    ["a", "b", "c", "d", "e"],
    [
      ["a", "~", "c", "d", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "~", "d", "e"],
      ["a", "~", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "~", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "A", "d", "B"],
      ["a", "A", "c", "B", "e"],
      ["a", "A", "c", "d", "B"],
      ["a", "b", "A", "d", "B"]
    ]
  );
});

const testNormalize = (words, expectList) => {
  const r = phrase.normalize(words);
  for (let i = 0; i < expectList.length; i++) {
    const e = expectList[i];
    expect(include(r, e)).toBeTruthy();
  }
};

const include = (list, b) => {
  let found = false;
  const json = JSON.stringify(b);
  for (let i = 0; i < list.length; i++) {
    if (JSON.stringify(list[i]) === json) {
      found = true;
    }
  }
  if (!found) {
    console.error(list);
    console.error(b);
  }
  return found;
};
