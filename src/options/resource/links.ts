/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { BROWSER, ExternalLinks } from "../types";

const Links: ExternalLinks = {
  windowManipulation: "https://github.com/wtetsu/mouse-dictionary/wiki/Window-manipulation",
  downloadDictData: "https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data",
  setKeyboardShortcuts: "",
};

if (BROWSER === "FIREFOX") {
  Links.setKeyboardShortcuts = "https://github.com/wtetsu/mouse-dictionary/wiki/Keyboard-shortcuts-(Firefox)";
} else {
  Links.setKeyboardShortcuts = "https://github.com/wtetsu/mouse-dictionary/wiki/Keyboard-shortcuts";
}

export { Links };
