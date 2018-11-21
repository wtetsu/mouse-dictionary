/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// A wrapper of chrome.storage.sync.
const sync = {
  get: keys => {
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
  set: items => {
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
  }
};

const local = {
  get: keys => {
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
  }
};

export default { sync, local };
