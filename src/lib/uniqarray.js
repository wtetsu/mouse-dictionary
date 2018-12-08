/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

class UniqArray {
  constructor() {
    this.array = [];
    this.set = new Set();
    this.filter = null;
  }

  push(newItem) {
    if (this.filter !== null && !this.filter(newItem)) {
      return;
    }
    if (this.set.has(newItem)) {
      return;
    }

    this.array.push(newItem);
    this.set.add(newItem);
  }

  merge(anotherArray) {
    for (let i = 0; i < anotherArray.length; i++) {
      this.push(anotherArray[i]);
    }
  }

  toArray() {
    return this.array;
  }
}

export default UniqArray;
