/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A wrapper of chrome.storage.sync.
const sync = {
  async get(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  async set(items) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  async pickOut(key) {
    const data = await sync.get(key);
    return data[key];
  }
};

const local = {
  async get(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  async pickOut(key) {
    const data = await local.get(key);
    return data[key];
  },
  async getBytesInUse() {
    if (!chrome.storage.local.getBytesInUse) {
      // Firefox doesn't support getBytesInUse(at least 62.0)
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.getBytesInUse(null, data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
};

export default { sync, local };
