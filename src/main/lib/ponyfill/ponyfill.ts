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

// Selected at build time by the BROWSER constant
let ponyfill!: Ponyfill;
if (BROWSER === "chrome") {
  ponyfill = chrome;
}
if (BROWSER === "firefox") {
  ponyfill = firefox;
}
if (BROWSER === "safari") {
  ponyfill = safari;
}
export default ponyfill;
