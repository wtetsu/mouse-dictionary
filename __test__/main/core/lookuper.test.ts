import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import entryDefault from "../../../src/main/core/entry/default";
import Lookuper from "../../../src/main/core/lookuper";
import defaultSettings from "../../../src/main/settings";
import testdata from "../../testdata";
import Chrome from "../chrome";

const DICTIONARY = {
  dog: "犬",
  cat: "猫",
  kitty: "＝cat",
  pup: "<→puppy>",
  puppy: "子犬",
};

let doUpdateContent: ReturnType<typeof vi.fn>;

beforeAll(() => {
  testdata.load();
});

beforeEach(() => {
  const chrome = new Chrome();
  Object.assign(chrome.storage.local.data, DICTIONARY);
  global.chrome = chrome as any;
  doUpdateContent = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const createLookuper = (doBuildEntry = entryDefault()) => new Lookuper(defaultSettings, doBuildEntry, doUpdateContent);

const selectText = (text: string) => {
  vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => text } as any);
};

const updatedText = () => doUpdateContent.mock.lastCall[0].textContent;

describe("lookup", () => {
  test("should update content with the found descriptions", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.lookup("dogs")).toBe(true);
    expect(doUpdateContent).toHaveBeenCalledTimes(1);
    expect(updatedText()).toContain("犬");
    expect(doUpdateContent.mock.lastCall[1]).toEqual(1);
  });

  test("should update content even if nothing is found", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.lookup("zzz")).toBe(true);
    expect(doUpdateContent.mock.lastCall[1]).toEqual(0);
  });

  test("should skip the same text", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.lookup("dog")).toBe(true);
    expect(await lookuper.lookup("dog")).toBe(false);
    expect(doUpdateContent).toHaveBeenCalledTimes(1);
  });

  test("should look up multiple texts at once", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.lookupAll(["dog", "", "cat"])).toBe(true);
    expect(updatedText()).toContain("犬");
    expect(updatedText()).toContain("猫");
    expect(doUpdateContent.mock.lastCall[1]).toEqual(2);
  });

  test("should follow references in descriptions", async () => {
    const lookuper = createLookuper();
    await lookuper.lookupAll(["kitty", "pup"]);
    expect(updatedText()).toContain("猫");
    expect(updatedText()).toContain("子犬");
    expect(doUpdateContent.mock.lastCall[1]).toEqual(4);
  });

  test("should truncate long text", async () => {
    const doBuildEntry = vi.fn(() => ({ entries: [], lang: "en" }));
    const lookuper = createLookuper(doBuildEntry);
    await lookuper.lookup("a".repeat(200));
    expect(doBuildEntry).toHaveBeenCalledWith("a".repeat(128), false, false);
  });
});

describe("conditions to update", () => {
  test("should not update while suspended", async () => {
    const lookuper = createLookuper();
    lookuper.suspended = true;
    expect(await lookuper.lookup("dog")).toBe(false);
    expect(doUpdateContent).not.toHaveBeenCalled();
  });

  test("should not update while some text is selected", async () => {
    const lookuper = createLookuper();
    selectText("selected");
    expect(await lookuper.lookup("dog")).toBe(false);
  });

  test("should update while half-locked and not aimed", async () => {
    const lookuper = createLookuper();
    selectText("selected");
    lookuper.halfLocked = true;
    expect(await lookuper.lookup("dog")).toBe(true);
  });

  test("should not update while half-locked and aimed", async () => {
    const lookuper = createLookuper();
    await lookuper.aimedLookup("cat");
    lookuper.halfLocked = true;
    expect(await lookuper.lookup("dog")).toBe(false);
  });
});

describe("aimedLookup", () => {
  test("should update content only when something is found", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.aimedLookup("zzz")).toBe(false);
    expect(doUpdateContent).not.toHaveBeenCalled();
    expect(lookuper.aimed).toBe(true);

    expect(await lookuper.aimedLookup("dog")).toBe(true);
    expect(updatedText()).toContain("犬");
  });

  test("should skip the same text", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.aimedLookup("dog")).toBe(true);
    expect(await lookuper.aimedLookup("dog")).toBe(false);
  });

  test("should reset aimed state for empty text", async () => {
    const lookuper = createLookuper();
    await lookuper.aimedLookup("dog");
    expect(await lookuper.aimedLookup("")).toBe(false);
    expect(lookuper.aimed).toBe(false);
  });
});

describe("update", () => {
  test("should do nothing for empty text", async () => {
    const lookuper = createLookuper();
    expect(await lookuper.update("", false, false, false)).toBe(false);
    expect(doUpdateContent).not.toHaveBeenCalled();
  });

  test("should update content regardless of selection", async () => {
    const lookuper = createLookuper();
    selectText("selected");
    expect(await lookuper.update("dog", false, true, true)).toBe(true);
    expect(updatedText()).toContain("犬");
  });
});

describe("concurrent lookups", () => {
  // Holds storage reads until release() is called
  const deferStorage = () => {
    const local = global.chrome.storage.local;
    const orgGet = local.get.bind(local);
    const pending: (() => void)[] = [];
    const spy = vi
      .spyOn(local, "get")
      .mockImplementation((keys: any) => new Promise((resolve) => pending.push(() => resolve(orgGet(keys)))));
    const release = async (index: number) => {
      pending[index]();
      await new Promise((r) => setTimeout(r, 0));
    };
    return { spy, release };
  };

  test("should discard an older result that arrives after a newer one", async () => {
    const lookuper = createLookuper();
    const { release } = deferStorage();
    const dog = lookuper.lookupAll(["dog"]);
    const cat = lookuper.lookupAll(["cat"]);
    await release(1);
    await release(0);
    expect(await cat).toBe(true);
    expect(await dog).toBe(false);
    expect(doUpdateContent).toHaveBeenCalledTimes(1);
    expect(updatedText()).toContain("猫");
  });

  test("should not start the same lookup while it is in flight", async () => {
    const lookuper = createLookuper();
    const { spy, release } = deferStorage();
    const first = lookuper.lookupAll(["dog"]);
    const second = lookuper.lookupAll(["dog"]);
    expect(spy).toHaveBeenCalledTimes(1);
    await release(0);
    expect(await first).toBe(true);
    expect(await second).toBe(false);
    expect(doUpdateContent).toHaveBeenCalledTimes(1);
  });
});

test("should retry the same text after a failed lookup", async () => {
  const lookuper = createLookuper();
  vi.spyOn(global.chrome.storage.local, "get").mockRejectedValueOnce(new Error("failed"));
  await expect(lookuper.lookupAll(["dog"])).rejects.toThrow("failed");

  expect(await lookuper.lookupAll(["dog"])).toBe(true);
  expect(updatedText()).toContain("犬");
});

describe("cache", () => {
  test("should reuse the content without reading storage again", async () => {
    vi.stubEnv("MODE", "production");
    const lookuper = createLookuper();
    const spy = vi.spyOn(global.chrome.storage.local, "get");
    expect(await lookuper.lookupAll(["dog"])).toBe(true);
    expect(await lookuper.lookupAll(["cat"])).toBe(true);
    const callCount = spy.mock.calls.length;

    // Reported as updated so that the caller resets the scroll
    expect(await lookuper.lookupAll(["dog"])).toBe(true);
    expect(spy).toHaveBeenCalledTimes(callCount);
    expect(doUpdateContent).toHaveBeenCalledTimes(3);
    expect(updatedText()).toContain("犬");
  });

  test("should not share the content between different options", async () => {
    vi.stubEnv("MODE", "production");
    const lookuper = createLookuper();
    const spy = vi.spyOn(global.chrome.storage.local, "get");
    await lookuper.update("dog", !defaultSettings.lookupWithCapitalized, false, false);
    await lookuper.lookupAll(["cat"]);
    const callCount = spy.mock.calls.length;

    await lookuper.lookupAll(["dog"]);
    expect(spy.mock.calls.length).toBeGreaterThan(callCount);
  });

  test("should be disabled outside production", async () => {
    const lookuper = createLookuper();
    const spy = vi.spyOn(global.chrome.storage.local, "get");
    await lookuper.lookupAll(["dog"]);
    await lookuper.lookupAll(["cat"]);
    const callCount = spy.mock.calls.length;
    await lookuper.lookupAll(["dog"]);
    expect(spy.mock.calls.length).toBeGreaterThan(callCount);
  });
});

test("run should return html and hit count", async () => {
  const lookuper = createLookuper();
  const { html, hit } = await lookuper.run("cat", false, false, false);
  expect(html).toContain("猫");
  expect(hit).toEqual(1);
});
