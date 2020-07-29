/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const locals = {
  get: (...args) => chrome.storage.local.get(...args),
  set: (...args) => chrome.storage.local.set(...args),
};

const syncs = {
  get: (...args) => chrome.storage.sync.get(...args),
  set: (...args) => chrome.storage.sync.set(...args),
};

const sync = {
  get: async (args) => doAsync(syncs.get, args),
  set: async (args) => doAsync(syncs.set, args),
  async pick(key) {
    const data = await sync.get(key);
    return data?.[key];
  },
};

const local = {
  get: async (args) => doAsync(locals.get, args),
  set: async (args) => doAsync(locals.set, args),
  async pick(key) {
    const data = await local.get(key);
    return data?.[key];
  },
};

const doAsync = async (fn, params) => {
  if (!fn) {
    return null;
  }
  return new Promise((resolve, reject) => {
    try {
      const callBack = (data) => {
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

export default { local, sync, doAsync };
