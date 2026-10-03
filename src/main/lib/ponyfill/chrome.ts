/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import type { CaretPosition } from "./ponyfill";

const getComputedCssText = (params: Element): string => {
  const computedStyle = window.getComputedStyle(params);
  return computedStyle.cssText;
};

const getCaretNodeAndOffsetFromPoint = (
  ownerDocument: Document,
  pointX: number,
  pointY: number,
): CaretPosition | null => {
  const range = ownerDocument.caretRangeFromPoint(pointX, pointY);
  if (!range) {
    return null;
  }
  return {
    node: range.startContainer,
    offset: range.startOffset,
  };
};

export default { getComputedCssText, getCaretNodeAndOffsetFromPoint };
