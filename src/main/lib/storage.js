/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ext from "./ext";

const sync = {
  get: (keys) => ext().storage.sync.get(keys),
  set: (items) => ext().storage.sync.set(items),
};

const local = {
  get: (keys) => ext().storage.local.get(keys),
  set: (items) => ext().storage.local.set(items),
  async pick(key) {
    const data = await local.get([key]);
    return data?.[key];
  },
};

export default { local, sync };
