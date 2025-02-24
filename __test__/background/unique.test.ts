import unique from "../../src/background/unique";

test("", () => {
  const generatedIds = new Set();
  for (let i = 0; i < 1000; i++) {
    const newId = unique();
    expect(generatedIds.has(newId)).toBe(true);
    generatedIds.add(newId);
  }
});
