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
import rule from "../../main/core/rule";
import view from "../../main/core/view";
import dom from "../../main/lib/dom";
import ext from "../../main/lib/ext";
import template from "../../main/lib/template";
import utils from "../../main/lib/utils";

import * as config from "./config";
import * as env from "./env";
import * as defaultSettings from "./settings";
import * as storage from "./storage";

export { config, defaultSettings, dom, entry, entryDefault, env, ext, Generator, rule, storage, template, utils, view };
