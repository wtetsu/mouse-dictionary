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

    let header;
    if (settings.showTitlebar) {
      header = createHeaderElement(settings);
      dialog.appendChild(header);
    }

    const content = createContentWrapperElement(settings);
    dialog.appendChild(content);

    return { dialog, header, content };
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
    titlebarBackgroundColor: settings.titlebarBackgroundColor,
    width: settings.width,
    height: settings.height,
    scroll: settings.scroll
  });
  const dialog = dom.create(html);
  dom.applyStyles(dialog, settings.normalDialogStyles);
  return dialog;
};

const createHeaderElement = settings => {
  const compiledTemplate = Hogan.compile(settings.titlebarTemplate);
  const html = compiledTemplate.render({
    backgroundColor: settings.backgroundColor,
    titlebarBackgroundColor: settings.titlebarBackgroundColor
  });
  return dom.create(html);
};

const createContentWrapperElement = settings => {
  const dialog = dom.create(settings.contentWrapperTemplate);
  return dialog;
};
