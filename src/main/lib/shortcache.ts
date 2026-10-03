/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

type CacheEntry<T> = { key: string; value: T };

class ShortCache<T> {
  private readonly size: number;
  private readonly list: (CacheEntry<T> | "")[];
  private readonly dict = new Map<string, number>();
  private index = 0;

  constructor(size: number) {
    this.size = size;
    this.list = createArray<CacheEntry<T> | "">(size, "");
  }

  put(key: string, value: T): void {
    if (this.size <= 0 || this.get(key)) {
      return;
    }

    const currentData = this.list[this.index];
    if (currentData) {
      this.dict.delete(currentData.key);
      currentData.key = key;
      currentData.value = value;
    } else {
      this.list[this.index] = { key, value };
    }

    this.dict.set(key, this.index);

    this.index = (this.index + 1) % this.size;
  }

  get(key: string): T | null {
    if (!key) {
      return null;
    }
    const index = this.dict.get(key);
    // index is NaN when size is 0
    if (index === undefined || !Number.isFinite(index)) {
      return null;
    }
    return (this.list[index] as CacheEntry<T>).value;
  }
}

/**
 * Create a "packed" array.
 * See also: https://v8.dev/blog/elements-kinds
 */
const createArray = <T>(length: number, initialValue: T): T[] => {
  const newArray: T[] = [];
  for (let i = 0; i < length; i++) {
    newArray.push(initialValue);
  }
  return newArray;
};

export default ShortCache;
