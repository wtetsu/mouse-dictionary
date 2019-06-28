/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const loadJson = async fname => {
  const url = chrome.extension.getURL(fname);
  return fetch(url).then(r => r.json());
};

const updateMap = (map, data) => {
  for (let i = 0; i < data.length; i++) {
    const arr = data[i];
    map.set(arr[0], arr[1]);
  }
};

const omap = (o, funcOrValue, props) => {
  const result = {};
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    result[prop] = funcOrValue ? funcOrValue(o[prop]) : funcOrValue;
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

/*
const position = omap(dialog.style, convertToInt, ["top", "left","width","height"])
isInsideRange(position, {x:e.clientX, y.clientY})

isOnTheWindow(dialog.style, e);

const isOnTheWindow = (style, e) => {
  const top = parseInt(style.top, 10);
  const left = parseInt(style.left, 10);
  const width = parseInt(style.width, 10);
  const height = parseInt(style.height, 10);
  return e.clientX >= left && e.clientX <= left + width && (e.clientY >= top && e.clientY <= top + height);
};
*/

const convertToInt = str => {
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

export default { loadJson, updateMap, omap, areSame, isInsideRange, convertToInt };
