/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

class ShortCache {
  constructor(size) {
    this.size = size;

    this.list = new Array(size);
    this.dict = {};
    this.index = 0;
  }

  put(key, value) {
    if (this.get(key)) {
      return;
    }

    let currentData = this.list[this.index];
    if (currentData) {
      const oldKey = currentData.key;
      delete this.dict[oldKey];
    } else {
      currentData = {};
      this.list[this.index] = currentData;
    }
    currentData.key = key;
    currentData.value = value;

    this.dict[key] = this.index;

    this.index = (this.index + 1) % this.size;
  }

  get(key) {
    if (!key) {
      return null;
    }

    const index = this.dict[key];
    if (index === undefined) {
      return null;
    }

    return this.list[index].value;
  }
}

export default ShortCache;
