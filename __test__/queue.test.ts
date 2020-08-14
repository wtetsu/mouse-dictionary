import ExpiringQueue from "../src/background/queue";

test("", async () => {
  const queue = new ExpiringQueue(5);

  expect(queue.get("")).toEqual(null);

  queue.push("XXX", "XXX!");
  queue.push("ZZZ", "ZZZ!");
  expect(queue.shiftId()).toEqual("XXX");
  expect(queue.shiftId()).toEqual("ZZZ");
  expect(queue.shiftId()).toEqual(null);
  expect(queue.shiftId()).toEqual(null);

  queue.push("01", "ABC01");
  queue.push("02", "ABC02");
  queue.push("03", "ABC03");

  expect(queue.get("01")).toEqual("ABC01");
  expect(queue.get("02")).toEqual("ABC02");
  expect(queue.get("03")).toEqual("ABC03");
  expect(queue.get("04")).toEqual(null);

  expect(queue.shiftId()).toEqual("01");
  expect(queue.shiftId()).toEqual("02");

  expect(queue.get("01")).toEqual("ABC01");
  expect(queue.get("02")).toEqual("ABC02");
  expect(queue.get("03")).toEqual("ABC03");
  expect(queue.get("04")).toEqual(null);

  await sleep(10);

  expect(queue.get("01")).toEqual(null);
  expect(queue.get("02")).toEqual(null);
  expect(queue.get("03")).toEqual(null);
  expect(queue.get("04")).toEqual(null);
});

const sleep = (time: number) => {
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, time);
  });
};
