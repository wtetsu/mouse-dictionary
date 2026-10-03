/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */
/* istanbul ignore file */

import ext from "../../main/lib/ext";
import orgStorage from "../../main/lib/storage";

const local = {
  ...orgStorage.local,
  getBytesInUse: (): Promise<number> => ext().storage.local.getBytesInUse(),
};

export { local };
