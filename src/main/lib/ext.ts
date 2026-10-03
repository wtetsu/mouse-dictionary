/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Returns the Promise-based WebExtension API namespace.
// Chrome (MV3) returns Promises from chrome.*, while Firefox/Safari (MV2) guarantee them only on browser.*
// Resolved on each call so that the API object can be replaced (e.g. in tests).
const ext = (): typeof chrome => (BROWSER === "chrome" ? chrome : browser);

export default ext;
