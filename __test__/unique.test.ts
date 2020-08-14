import unique from "../src/background/unique";

test("", () => {
  expect(unique(1).length).toEqual(1);
  expect(unique(32).length).toEqual(32);
  expect(unique(128).length).toEqual(128);

  let preId = "";
  for (let i = 0; i < 100; i++) {
    const newId = unique(32);

    if (preId === newId) {
      throw new Error();
    }
    preId = newId;
  }
});
