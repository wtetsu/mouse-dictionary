/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A wrapper of chrome.storage.sync.
const sync = {
  async get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  },
  async set(items) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
  async pickOut(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data[key]);
        }
      });
    });
  }
};

const local = {
  async get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  },
  async set(items) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
  async pickOut(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, data => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data[key]);
        }
      });
    });
  },
  async clear() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
  async getBytesInUse() {
    // note: Firefox doesn't support getBytesInUse(at least 62.0)
    //return doAsync(chrome.storage.local.getBytesInUse);
    return new Promise((resolve, reject) => {
      chrome.storage.local.getBytesInUse(bytesInUse => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(bytesInUse);
        }
      });
    });
  }
};

export default { sync, local };
