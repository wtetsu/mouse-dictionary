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
