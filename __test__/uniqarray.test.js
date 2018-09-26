import UniqArray from "../src/uniqarray";

test("", () => {
  const ua = new UniqArray();
  expect(ua.toArray()).toEqual([]);

  ua.push("item0");
  ua.push("item1");
  ua.push("item2");
  expect(ua.toArray()).toEqual(["item0", "item1", "item2"]);

  ua.push("item1");
  ua.push("item2");
  ua.push("item3");
  expect(ua.toArray()).toEqual(["item0", "item1", "item2", "item3"]);

  ua.merge(["item3", "item4", "item4", "item1", "item2", "item5"]);
  expect(ua.toArray()).toEqual(["item0", "item1", "item2", "item3", "item4", "item5"]);
});

test("", () => {
  const ua = new UniqArray();

  const startTime = new Date().getTime();

  for (let i = 0; i < 100000; i++) {
    const num = i % 10000;
    const newItem = `item${num}`;
    ua.push(newItem);
  }

  // This naive implementation is really slow...
  // for (let i = 0; i < 1000000; i++) {
  //   const num = i % 10000;
  //   const newItem = `item${num}`;
  //   if (!arr.includes(newItem)) {
  //     arr.push(newItem);
  //   }
  // }

  const time = new Date().getTime() - startTime;

  // Basically, it would finish in 10~20ms.
  if (time >= 100) {
    console.warn("too slow");
  }

  expect(ua.toArray().length).toEqual(10000);
});
