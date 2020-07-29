/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

const getComputedCssText = (params) => {
  const computedStyle = window.getComputedStyle(params);

  const styles = [];
  for (let key in computedStyle) {
    if (!isNumberString(key)) {
      const value = computedStyle[key];
      styles.push(`${key}:${value}`);
    }
  }
  return styles.join(";");
};

const isNumberString = (str) => {
  if (!str) {
    return false;
  }
  let isNumberStr = true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const isNumberChar = code >= 48 && code <= 57;
    if (!isNumberChar) {
      isNumberStr = false;
      break;
    }
  }
  return isNumberStr;
};

const getCaretNodeAndOffsetFromPoint = (ownerDocument, pointX, pointY) => {
  const position = ownerDocument.caretPositionFromPoint(pointX, pointY);
  if (!position) {
    return null;
  }
  return {
    node: position.offsetNode,
    offset: position.offset,
  };
};

export default { getComputedCssText, getCaretNodeAndOffsetFromPoint };
