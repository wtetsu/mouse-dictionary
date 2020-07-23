/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import * as config from "./config";
import * as data from "./data";
import { debounce } from "./debounce";
import * as dict from "../logic/dict";
import * as storage from "../logic/storage";
import * as message from "../logic/message";
import { Preview } from "../logic/preview";
import * as res from "../logic/resource";

export { config, data, debounce, dict, storage, message, res, Preview };
