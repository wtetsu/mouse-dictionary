/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Mustache from "mustache";

const parse = (template) => Mustache.parse(template);

const render = (template, view) => Mustache.render(template, view);

export default { parse, render };
