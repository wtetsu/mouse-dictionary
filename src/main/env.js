/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const env = {};

if (BROWSER === "FIREFOX") {
  // When Mouse Dictionary loads dictionary data,
  // Larger registerRecordsAtOnce cause memory hog especially for Firefox
  env.registerRecordsAtOnce = 1000;

  // About storing data of windows status(e.g. position, size)
  // I was not able to make the feature stable on Firefox, so it is disabled for now.
  env.enableWindowStatusSave = false;
  env.enableUserSettings = false;
} else {
  env.registerRecordsAtOnce = 100000;
  env.enableWindowStatusSave = true;
  env.enableUserSettings = true;
}

export default env;
