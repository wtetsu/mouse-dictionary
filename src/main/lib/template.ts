/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Mustache from "mustache";

const parse = (template: string) => Mustache.parse(template);

const render = (template: string, view: unknown): string => Mustache.render(template, view);

export default { parse, render };
