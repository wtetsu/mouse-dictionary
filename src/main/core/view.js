/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";
import dom from "../lib/dom";

const STYLES_SCROLL = "border-radius: 5px 0px 0px 5px;";
const STYLES_NORMAL = "border-radius: 5px 5px 5px 5px;";

const createDialogElement = (settings) => {
  const compiledTemplate = Hogan.compile(settings.dialogTemplate);
  const systemStyles = settings.scroll === "scroll" ? STYLES_SCROLL : STYLES_NORMAL;

  const html = compiledTemplate.render({
    systemStyles,
    backgroundColor: settings.backgroundColor,
    width: settings.width,
    height: settings.height,
    scroll: settings.scroll,
  });
  const dialog = dom.create(html);
  dom.applyStyles(dialog, settings.normalDialogStyles);
  return dialog;
};

const create = (settings) => {
  const dialog = createDialogElement(settings);
  const content = dom.create(settings.contentWrapperTemplate);
  dialog.appendChild(content);
  return { dialog, content };
};

export default { create };
