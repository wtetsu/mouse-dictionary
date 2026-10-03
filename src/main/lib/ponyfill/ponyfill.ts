/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import chrome from "./chrome";
import firefox from "./firefox";
import safari from "./safari";

export type CaretPosition = { node: Node; offset: number };

export type Ponyfill = {
  getComputedCssText: (element: Element) => string;
  getCaretNodeAndOffsetFromPoint: (ownerDocument: Document, pointX: number, pointY: number) => CaretPosition | null;
};

// Resolved at build time so that unused implementations are tree-shaken
let ponyfill: Ponyfill = chrome;
if (BROWSER === "firefox") {
  ponyfill = firefox;
}
if (BROWSER === "safari") {
  ponyfill = safari;
}
export default ponyfill;
