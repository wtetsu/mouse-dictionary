/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import orgStorage from "../../lib/storage";

type StorageApi = {
  get: (items: string[]) => Promise<Record<string, string>>;
  set: (items: Record<string, string>) => Promise<void>;
  pick: (item: string) => Promise<string>;
  getBytesInUse: () => Promise<number>;
};

type Storage = {
  local: StorageApi;
  sync: StorageApi;
};

type ByteInUseCallback = (bytesInUse: number) => void;

const local = {
  ...orgStorage.local,
  ...{
    getBytesInUse: async () =>
      orgStorage.doAsync((callback: ByteInUseCallback) => chrome.storage.local.getBytesInUse(callback)),
  },
};

const sync = {
  ...orgStorage.sync,
  ...{
    getBytesInUse: async () =>
      orgStorage.doAsync((callback: ByteInUseCallback) => chrome.storage.sync.getBytesInUse(callback)),
  },
};

export { local, sync };
