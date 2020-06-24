/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const loadJson = async (fname) => {
  const url = chrome.extension.getURL(fname);
  return fetch(url).then((r) => r.json());
};

const updateMap = (map, data) => {
  for (let i = 0; i < data.length; i++) {
    const arr = data[i];
    map.set(arr[0], arr[1]);
  }
};

/**
 * omap({ a: 1, b: 2, c: 3 }, v => v * 2, ["b", "c"]);
 *   -> { a: 1, b: 4, c: 6 }
 */
const omap = (object, func, specifiedProps) => {
  const result = {};
  const props = specifiedProps ?? Object.keys(object);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    result[prop] = func ? func(object[prop]) : null;
  }
  return result;
};

const areSame = (a, b) => {
  // On the assumption that both have the same properties
  const props = Object.keys(b);
  let same = true;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (a[prop] !== b[prop]) {
      same = false;
      break;
    }
  }
  return same;
};

const isInsideRange = (range, position) => {
  return (
    position.x >= range.left &&
    position.x <= range.left + range.width &&
    position.y >= range.top &&
    position.y <= range.top + range.height
  );
};

const convertToInt = (str) => {
  let r;
  if (str === null || str === undefined || str === "") {
    r = 0;
  } else {
    r = parseInt(str, 10);
    if (isNaN(r)) {
      r = 0;
    }
  }
  return r;
};

const convertToStyles = (position) => {
  const styles = {};
  const keys = Object.keys(position);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const n = position[key];
    if (Number.isFinite(n)) {
      styles[key] = `${n}px`;
    }
  }
  return styles;
};

const optimizeInitialPosition = (position, minWindowSize = 50, edgeSpace = 5) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  return {
    left: range(edgeSpace, position.left, windowWidth - position.width - edgeSpace),
    top: range(edgeSpace, position.top, windowHeight - position.height - edgeSpace),
    width: range(minWindowSize, position.width, windowWidth - edgeSpace * 2),
    height: range(minWindowSize, position.height, windowHeight - edgeSpace * 2),
  };
};

const range = (minValue, value, maxValue) => {
  let r = value;
  r = min(r, maxValue);
  r = max(r, minValue);
  return r;
};

const max = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.max(a, b);
  } else {
    return null;
  }
};

const min = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.min(a, b);
  } else {
    return null;
  }
};

const getSelection = () => {
  const selection = window.getSelection();
  return selection.toString().replace("\r", " ").replace("\n", " ").trim();
};

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
};
