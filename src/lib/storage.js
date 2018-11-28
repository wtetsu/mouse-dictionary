/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A wrapper of chrome.storage.sync.
const sync = {
  async get(keys) {
    return doAsync(chrome.storage.sync.get, keys);
  },
  async set(items) {
    return doAsync(chrome.storage.sync.set, items);
  },
  async pickOut(key) {
    const data = await sync.get(key);
    return data[key];
  }
};

const local = {
  async get(keys) {
    return doAsync(chrome.storage.local.get, keys);
  },
  async set(items) {
    return doAsync(chrome.storage.local.set, items);
  },
  async pickOut(key) {
    const data = await local.get(key);
    return data[key];
  },
  async clear() {
    return doAsync(chrome.storage.local.clear);
  },
  async getBytesInUse() {
    // note: Firefox doesn't support getBytesInUse(at least 62.0)
    return doAsync(chrome.storage.local.getBytesInUse);
  }
};

const doAsync = async (fn, params) => {
  if (!fn) {
    return null;
  }
  return new Promise((resolve, reject) => {
    try {
      const callBack = data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      };
      if (params) {
        fn(params, callBack);
      } else {
        fn(callBack);
      }
    } catch (e) {
      reject(e);
    }
  });
};

export default { sync, local };
