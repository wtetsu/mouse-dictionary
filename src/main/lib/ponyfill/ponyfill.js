/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import chrome from "./chrome";
import firefox from "./firefox";
import safari from "./safari";

let ponyfill;
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
