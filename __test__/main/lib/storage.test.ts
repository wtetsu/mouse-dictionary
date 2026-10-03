import { afterEach, beforeEach, expect, test, vi } from "vitest";
import storage from "../../../src/main/lib/storage";
import Chrome from "../chrome";

beforeEach(() => {
  global.chrome = new Chrome() as any;
});

afterEach(() => {});

test("should handle local storage get and set operations correctly", async () => {
  expect(await storage.local.get([])).toEqual({});
  expect(await storage.local.get(["key01"])).toEqual({});
  expect(await storage.local.pick("key01")).toEqual(undefined);

  await storage.local.set({});
  expect(await storage.local.get(["key01"])).toEqual({});

  await storage.local.set({ key01: "value01", key02: "value02" });
  expect(await storage.local.get(["key01"])).toEqual({ key01: "value01" });
  expect(await storage.local.get(["key01", "key02"])).toEqual({ key01: "value01", key02: "value02" });
  expect(await storage.local.pick("key01")).toEqual("value01");

  await storage.local.set({ key01: "value01!", key02: "value02!" });
  expect(await storage.local.get(["key01"])).toEqual({ key01: "value01!" });
  expect(await storage.local.get(["key01", "key02"])).toEqual({ key01: "value01!", key02: "value02!" });
  expect(await storage.local.pick("key01")).toEqual("value01!");
});

test("should handle sync storage get and set operations correctly", async () => {
  expect(await storage.sync.get([])).toEqual({});
  expect(await storage.sync.get(["key01"])).toEqual({});

  await storage.sync.set({});
  expect(await storage.sync.get(["key01"])).toEqual({});

  await storage.sync.set({ key01: "value01", key02: "value02" });
  expect(await storage.sync.get(["key01"])).toEqual({ key01: "value01" });
  expect(await storage.sync.get(["key01", "key02"])).toEqual({ key01: "value01", key02: "value02" });

  await storage.sync.set({ key01: "value01!", key02: "value02!" });
  expect(await storage.sync.get(["key01"])).toEqual({ key01: "value01!" });
  expect(await storage.sync.get(["key01", "key02"])).toEqual({ key01: "value01!", key02: "value02!" });
});

test("should throw an error when local storage get operation fails", async () => {
  vi.spyOn(global.chrome.storage.local, "get").mockRejectedValueOnce(new Error("error!"));
  await expect(storage.local.get([])).rejects.toThrow("error!");
});

test("should throw an error when sync storage get operation fails", async () => {
  vi.spyOn(global.chrome.storage.sync, "get").mockRejectedValueOnce(new Error("error!"));
  await expect(storage.sync.get([])).rejects.toThrow("error!");
});
