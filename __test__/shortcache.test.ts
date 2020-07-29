import ShortCache from "../src/main/lib/shortcache";

test("", () => {
  const cache = new ShortCache(3);

  expect(cache.get("key00")).toEqual(null);

  cache.put("key00", "val00");
  cache.put("key01", "val01");
  cache.put("key02", "val02");

  expect(cache.get("key00")).toEqual("val00");
  expect(cache.get("key01")).toEqual("val01");
  expect(cache.get("key02")).toEqual("val02");

  cache.put("key03", "val03");

  expect(cache.get("key00")).toEqual(null);
  expect(cache.get("key01")).toEqual("val01");
  expect(cache.get("key02")).toEqual("val02");
  expect(cache.get("key03")).toEqual("val03");

  cache.put("key01", "val01a");
  cache.put("key02", "val02a");

  expect(cache.get("key00")).toEqual(null);
  expect(cache.get("key01")).toEqual("val01");
  expect(cache.get("key02")).toEqual("val02");
  expect(cache.get("key03")).toEqual("val03");

  cache.put("key03", "val03b");
  cache.put("key04", "val04b");

  expect(cache.get("key00")).toEqual(null);
  expect(cache.get("key01")).toEqual(null);
  expect(cache.get("key02")).toEqual("val02");
  expect(cache.get("key03")).toEqual("val03");
  expect(cache.get("key04")).toEqual("val04b");

  cache.put("key05", "val05c");
  cache.put("key06", "val06c");

  expect(cache.get("key00")).toEqual(null);
  expect(cache.get("key01")).toEqual(null);
  expect(cache.get("key02")).toEqual(null);
  expect(cache.get("key03")).toEqual(null);
  expect(cache.get("key04")).toEqual("val04b");
  expect(cache.get("key05")).toEqual("val05c");
  expect(cache.get("key06")).toEqual("val06c");

  expect(cache.get(undefined)).toEqual(null);
});
