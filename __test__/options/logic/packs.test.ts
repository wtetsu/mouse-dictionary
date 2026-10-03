/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { describe, expect, test } from "vitest";
import {
  DEFAULT_PACK_IDS,
  FALLBACK_PACKS,
  mergeDescriptions,
  packIdsFromSettings,
} from "../../../src/options/logic/packs";

const REGISTRY = [
  { id: "en-ja", metaFile: "/data/dict.json" },
  { id: "en-fr", metaFile: "/data/dict-en-fr.json" },
  { id: "de-fr", metaFile: "/data/dict-de-fr.json" },
];

describe("mergeDescriptions", () => {
  test("returns incoming when there is no existing value", () => {
    expect(mergeDescriptions(undefined, "value")).toBe("value");
  });

  test("returns existing when incoming is empty", () => {
    expect(mergeDescriptions("existing", "")).toBe("existing");
  });

  test("returns existing when identical", () => {
    expect(mergeDescriptions("same", "same")).toBe("same");
  });

  test("joins different descriptions with separator", () => {
    expect(mergeDescriptions("AAA", "BBB")).toBe("AAA / BBB");
  });

  test("skips incoming when it is already contained in existing", () => {
    expect(mergeDescriptions("AAA / BBB", "BBB")).toBe("AAA / BBB");
  });

  test("prefers incoming when it contains existing entirely", () => {
    expect(mergeDescriptions("BBB", "AAA / BBB")).toBe("AAA / BBB");
  });

  test("treats non-string values (e.g. Object.prototype leak) as absent", () => {
    expect(mergeDescriptions((() => {}) as unknown as string, "real")).toBe("real");
    expect(mergeDescriptions("real", undefined)).toBe("real");
  });
});

describe("packIdsFromSettings", () => {
  test("undefined selection falls back to defaults present in the registry", () => {
    expect(packIdsFromSettings(REGISTRY, undefined)).toEqual(DEFAULT_PACK_IDS);
  });

  test("empty selection falls back to defaults", () => {
    expect(packIdsFromSettings(REGISTRY, [])).toEqual(DEFAULT_PACK_IDS);
  });

  test("unknown ids are ignored, falling back to defaults", () => {
    expect(packIdsFromSettings(REGISTRY, ["no-such-pack"])).toEqual(DEFAULT_PACK_IDS);
  });

  test("valid ids pass through in order", () => {
    expect(packIdsFromSettings(REGISTRY, ["de-fr", "en-ja"])).toEqual(["de-fr", "en-ja"]);
  });

  test("invalid ids are filtered out, valid ones kept", () => {
    expect(packIdsFromSettings(REGISTRY, ["en-fr", "bogus"])).toEqual(["en-fr"]);
  });

  test("defaults missing from the registry fall back to the first available pack", () => {
    const registry = [{ id: "xx-yy", metaFile: "/data/dict-xx-yy.json" }];
    expect(packIdsFromSettings(registry, undefined)).toEqual(["xx-yy"]);
  });
});

describe("FALLBACK_PACKS", () => {
  test("describes the historical single-dictionary layout", () => {
    expect(FALLBACK_PACKS).toEqual([{ id: "en-ja", metaFile: "/data/dict.json" }]);
  });

  test("default pack ids exist in the fallback registry", () => {
    for (const id of DEFAULT_PACK_IDS) {
      expect(FALLBACK_PACKS.some((p) => p.id === id)).toBe(true);
    }
  });
});
