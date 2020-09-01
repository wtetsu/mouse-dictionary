/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import orgStorage from "../../main/lib/storage";

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
