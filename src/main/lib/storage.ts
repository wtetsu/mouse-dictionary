/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ext from "./ext";

type Keys = string | string[] | null | undefined;
type Items = Record<string, unknown>;

const sync = {
  get: (keys?: Keys): Promise<Items> => ext().storage.sync.get(keys),
  set: (items: Items): Promise<void> => ext().storage.sync.set(items),
};

const local = {
  get: (keys?: Keys): Promise<Items> => ext().storage.local.get(keys),
  set: (items: Items): Promise<void> => ext().storage.local.set(items),
  async pick<T = unknown>(key: string): Promise<T | undefined> {
    const data = await local.get([key]);
    return data?.[key] as T | undefined;
  },
};

export default { local, sync };
