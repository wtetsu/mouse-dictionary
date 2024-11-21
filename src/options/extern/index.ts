/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */
/* istanbul ignore file */

// References to "main" functions

import entry from "../../main/core/entry";
import entryDefault from "../../main/core/entry/default";
import Generator from "../../main/core/generator";
import view from "../../main/core/view";
import dom from "../../main/lib/dom";
import template from "../../main/lib/template";

import * as config from "./config";
import * as env from "./env";
import * as defaultSettings from "./settings";
import * as storage from "./storage";

export { entry, entryDefault, Generator, view, dom, template, defaultSettings, env, config, storage };
