/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Registry of bundled dictionary packs (language pairs). The registry is a
// generated manifest (/data/packs.json, written by tools/make_dict.ts) that
// lists one entry per pack: { id, metaFile, label? }. Each metaFile points to
// a metadata file listing that pack's lookup shards. Keeping the registry as
// data means adding a language pair never requires changing this module.

import type { DictionaryPack } from "../types";

const PACKS_MANIFEST_FILE = "/data/packs.json";

// The historical single-dictionary layout. Used when /data/packs.json is
// missing or unreadable, which covers data bundles generated before this
// feature and stock builds: existing users always have a working default.
export const FALLBACK_PACKS: DictionaryPack[] = [{ id: "en-ja", metaFile: "/data/dict.json" }];

export const DEFAULT_PACK_IDS = ["en-ja"];

export const loadPackRegistry = async (): Promise<DictionaryPack[]> => {
  try {
    const response = await fetch(chrome.runtime.getURL(PACKS_MANIFEST_FILE));
    if (!response.ok) {
      return FALLBACK_PACKS;
    }
    const manifest = await response.json();
    const packs = (Array.isArray(manifest) ? manifest : [])
      .filter((p: DictionaryPack) => typeof p?.id === "string" && typeof p?.metaFile === "string")
      .map((p: DictionaryPack) => ({
        id: p.id,
        metaFile: p.metaFile,
        label: typeof p.label === "string" ? p.label : undefined,
      }));
    return packs.length > 0 ? packs : FALLBACK_PACKS;
  } catch {
    return FALLBACK_PACKS;
  }
};

export const packIdsFromSettings = (available: DictionaryPack[], packs: string[] | undefined): string[] => {
  const valid = (packs ?? DEFAULT_PACK_IDS).filter((id) => available.some((p) => p.id === id));
  if (valid.length > 0) {
    return valid;
  }
  // fall back to the defaults that actually exist in this build
  const fallback = DEFAULT_PACK_IDS.filter((id) => available.some((p) => p.id === id));
  return fallback.length > 0 ? fallback : available.map((p) => p.id).slice(0, 1);
};

// Join two descriptions of the same headword coming from different packs.
// Values that are not strings (e.g. prototype members leaked by key lookups
// such as "constructor") are treated as absent.
export const mergeDescriptions = (existing: unknown, incoming: unknown): string => {
  const a = typeof existing === "string" ? existing : "";
  const b = typeof incoming === "string" ? incoming : "";
  if (!a) {
    return b;
  }
  if (!b || a === b || a.includes(b)) {
    return a;
  }
  if (b.includes(a)) {
    return b;
  }
  return `${a} / ${b}`;
};
