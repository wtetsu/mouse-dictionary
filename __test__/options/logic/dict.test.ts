/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { beforeEach, expect, test, vi } from "vitest";
import Chrome from "../../main/chrome";

// dict.ts reads pack data via fetch(chrome.runtime.getURL(...)).
// Serve fake pack files from memory; unknown paths answer like a missing
// file (not ok), which exercises the registry fallback.
const PACK_FILES: Record<string, any> = {
  "/data/packs.json": [
    { id: "en-ja", metaFile: "/data/dict.json" },
    { id: "en-fr", metaFile: "/data/dict-en-fr.json" },
    { id: "ja-fr", metaFile: "/data/dict-ja-fr.json" },
  ],
  "/data/dict.json": { files: ["/data/dict0.json"] },
  // "constructor" mirrors real ejdict-hand data (data/dict/a.json5 has it):
  // a bare existing[head] lookup falls through to Object.prototype.constructor.
  "/data/dict0.json": { cat: "キャット", dog: "イヌ", constructor: "構築者" },
  "/data/dict-en-fr.json": { files: ["/data/dict-en-fr0.json"] },
  "/data/dict-en-fr0.json": { cat: "chat", water: "eau", constructor: "constructeur" },
  "/data/dict-ja-fr.json": { files: ["/data/dict-ja-fr0.json"] },
  "/data/dict-ja-fr0.json": { 猫: "chat", 水: "eau" },
};

const fetchMock = (url: string) => {
  // the test mock builds URLs as `chrome-extension://test/${path}`; with the
  // leading slash in our paths that yields a double slash — normalize it
  const path = String(url).replace("chrome-extension://test", "").replace(/^\/\//, "/");
  const data = PACK_FILES[path];
  if (data === undefined) {
    return { ok: false } as Response;
  }
  return { ok: true, json: async () => data } as Response;
};

beforeEach(() => {
  global.chrome = new Chrome() as any;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => fetchMock(url)),
  );
});

test("getPacks reads the generated manifest", async () => {
  const dict = await import("../../../src/options/logic/dict");
  const packs = await dict.getPacks();
  expect(packs.map((p) => p.id)).toEqual(["en-ja", "en-fr", "ja-fr"]);
});

test("getPacks falls back to the single-dictionary layout without a manifest", async () => {
  const saved = PACK_FILES["/data/packs.json"];
  delete PACK_FILES["/data/packs.json"];
  const dict = await import("../../../src/options/logic/dict");
  const packs = await dict.getPacks();
  expect(packs).toEqual([{ id: "en-ja", metaFile: "/data/dict.json" }]);
  // registration still works with the fallback registry
  const count = await dict.registerDefaultDict(() => {});
  expect(count).toBe(3);
  PACK_FILES["/data/packs.json"] = saved;
});

test("registerPacks merges descriptions when two packs share a headword", async () => {
  const dict = await import("../../../src/options/logic/dict");
  await dict.registerPacks(["en-ja", "en-fr"], () => {});

  const stored = await global.chrome.storage.local.get(["cat", "water", "dog", "constructor"]);
  expect(stored.cat).toBe("キャット / chat");
  expect(stored.water).toBe("eau");
  expect(stored.dog).toBe("イヌ");
  // "constructor" is a real English headword in both packs; the lookup must
  // not fall through to Object.prototype.constructor (regression: crash on
  // first-run registration when storage was empty).
  expect(stored.constructor).toBe("構築者 / constructeur");
});

test("registerPacks ignores unknown pack ids", async () => {
  const dict = await import("../../../src/options/logic/dict");
  const count = await dict.registerPacks(["en-ja", "no-such-pack"], () => {});
  expect(count).toBe(3);
});

test("syncInstalledPacks registers new packs and removes unselected ones", async () => {
  const dict = await import("../../../src/options/logic/dict");

  await dict.syncInstalledPacks(["en-ja", "ja-fr"], () => {});
  let stored = await global.chrome.storage.local.get(["cat", "猫"]);
  expect(stored.cat).toBe("キャット");
  expect(stored["猫"]).toBe("chat");

  // Drop ja-fr: its keys are removed, en-ja keys are re-registered.
  await dict.syncInstalledPacks(["en-ja"], () => {});
  stored = await global.chrome.storage.local.get(["cat", "猫"]);
  expect(stored["猫"]).toBeUndefined();
  expect(stored.cat).toBe("キャット");
});

test("syncInstalledPacks survives a stale id whose pack no longer exists", async () => {
  const dict = await import("../../../src/options/logic/dict");
  await dict.syncInstalledPacks(["en-ja"], () => {});
  await global.chrome.storage.local.set({ "***** dict_packs *****": ["ghost"] });
  const res = await dict.syncInstalledPacks(["en-ja"], () => {});
  expect(res.registered).toBe(3);
});
