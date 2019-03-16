/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";
import dom from "../lib/dom";

export default {
  create(settings) {
    const dialog = createDialogElement(settings);
    const content = createContentWrapperElement(settings);
    dialog.appendChild(content);

    return { dialog, content };
  }
};

const createDialogElement = settings => {
  const compiledTemplate = Hogan.compile(settings.dialogTemplate);

  let systemStyles;
  if (settings.scroll === "scroll") {
    systemStyles = "border-radius: 5px 0px 0px 5px;";
  } else {
    systemStyles = "border-radius: 5px 5px 5px 5px;";
  }

  const html = compiledTemplate.render({
    systemStyles,
    backgroundColor: settings.backgroundColor,
    width: settings.width,
    height: settings.height,
    scroll: settings.scroll
  });
  const dialog = dom.create(html);
  dom.applyStyles(dialog, settings.normalDialogStyles);
  return dialog;
};

const createContentWrapperElement = settings => {
  const dialog = dom.create(settings.contentWrapperTemplate);
  return dialog;
};
