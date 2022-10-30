/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import launch from "./core/launch";

const main = async () => {
  DEBUG && console.time("launch");
  await launch();
  DEBUG && console.timeEnd("launch");
};

main();
