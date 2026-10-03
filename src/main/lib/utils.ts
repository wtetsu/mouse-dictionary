/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type Rect = { left: number; top: number; width: number; height: number };

const loadJson = async <T = unknown>(fname: string): Promise<T> => {
  const url = chrome.runtime.getURL(fname);
  return fetch(url).then((r) => r.json());
};

const updateMap = <K, V>(map: Map<K, V>, data: [K, V][]): void => {
  for (let i = 0; i < data.length; i++) {
    const arr = data[i];
    map.set(arr[0], arr[1]);
  }
};

/**
 * omap({ a: 1, b: 2, c: 3 }, v => v * 2, ["b", "c"]);
 *   -> { a: 1, b: 4, c: 6 }
 */
const omap = <T, U>(
  object: Record<string, T>,
  func: ((value: T) => U) | null | undefined,
  specifiedProps?: string[],
): Record<string, U | null> => {
  const result: Record<string, U | null> = {};
  const props = specifiedProps ?? Object.keys(object);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    result[prop] = func ? func(object[prop]) : null;
  }
  return result;
};

const areSame = <T extends object>(a: T, b: Partial<T>): boolean => {
  // On the assumption that both have the same properties
  const props = Object.keys(b);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i] as keyof T;
    if (a[prop] !== b[prop]) {
      return false;
    }
  }
  return true;
};

const isInsideRange = (range: Rect, position: { x: number; y: number }): boolean => {
  return (
    position.x >= range.left &&
    position.x <= range.left + range.width &&
    position.y >= range.top &&
    position.y <= range.top + range.height
  );
};

const convertToInt = (str: string | number | null | undefined): number => {
  let r: number;
  if (str === null || str === undefined || str === "") {
    r = 0;
  } else {
    r = Number.parseInt(String(str), 10);
    if (Number.isNaN(r)) {
      r = 0;
    }
  }
  return r;
};

const convertToStyles = (position: Partial<Record<string, number | null>>): Record<string, string> => {
  const styles: Record<string, string> = {};
  const keys = Object.keys(position);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const n = position[key];
    if (typeof n === "number" && Number.isFinite(n)) {
      styles[key] = `${n}px`;
    }
  }
  return styles;
};

type NullableRect = { [K in keyof Rect]: number | null };

const optimizeInitialPosition = (position: Rect, minWindowSize = 50, edgeSpace = 5): NullableRect => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  return {
    left: clamp(position.left, edgeSpace, windowWidth - position.width - edgeSpace),
    top: clamp(position.top, edgeSpace, windowHeight - position.height - edgeSpace),
    width: clamp(position.width, minWindowSize, windowWidth - edgeSpace * 2),
    height: clamp(position.height, minWindowSize, windowHeight - edgeSpace * 2),
  };
};

const clamp = (value: number | null, minValue: number, maxValue: number): number | null => {
  let r = value;
  r = min(r, maxValue);
  r = max(r, minValue);
  return r;
};

const max = (a: number | null, b: number): number | null => {
  if (a !== null && Number.isFinite(a)) {
    return Math.max(a, b);
  }
  return null;
};

const min = (a: number | null, b: number): number | null => {
  if (a !== null && Number.isFinite(a)) {
    return Math.min(a, b);
  }
  return null;
};

const getSelection = (): string => {
  const selection = window.getSelection();
  return (selection?.toString() ?? "").replace(/[\r\n]/g, " ").trim();
};

// Returns the first supported primary language (e.g. "ja" for "ja-JP"), or "en"
const pickLanguage = (languages: readonly string[] | null | undefined, supportedLanguages: string[]): string => {
  for (const language of languages ?? []) {
    const lang = language.toLowerCase().split("-")[0];
    if (supportedLanguages.includes(lang)) {
      return lang;
    }
  }
  return "en";
};

// Printable ASCII
const isEnglishLikeCharacter = (code: number): boolean => 0x20 <= code && code <= 0x7e;

export default {
  loadJson,
  updateMap,
  omap,
  areSame,
  isInsideRange,
  convertToInt,
  convertToStyles,
  optimizeInitialPosition,
  getSelection,
  pickLanguage,
  isEnglishLikeCharacter,
};
