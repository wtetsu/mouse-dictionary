/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const env = {};

if (BROWSER === "FIREFOX") {
  env.enableWindowStatusSave = true;
  env.enableUserSettings = true;
} else {
  env.enableWindowStatusSave = true;
  env.enableUserSettings = true;
}

export default env;
