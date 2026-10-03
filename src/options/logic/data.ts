/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { produce } from "immer";
import type { MouseDictionarySettings } from "../types";

export const preProcessSettings = (settings: MouseDictionarySettings): MouseDictionarySettings => {
  return produce(settings, (d) => {
    for (let i = 0; i < d?.replaceRules?.length; i++) {
      d.replaceRules[i].key = i.toString();
    }
  });
};

export const postProcessSettings = (settings: MouseDictionarySettings): MouseDictionarySettings => {
  return produce(settings, (d) => {
    for (const replaceRule of d.replaceRules) {
      delete replaceRule.key;
    }
  });
};

// Replaces invalid numbers (NaN or negative integers) with 0
export const sanitizeNumbers = <T extends object>(patch: T): T => {
  return produce(patch, (d) => {
    for (const [name, value] of Object.entries(patch)) {
      if (typeof value === "number" && (Number.isNaN(value) || (Number.isInteger(value) && value < 0))) {
        (d as Record<string, unknown>)[name] = 0;
      }
    }
  });
};
