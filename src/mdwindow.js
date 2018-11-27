/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";
import dom from "./dom";

const mdwindow = {};
mdwindow.create = settings => {
  const dialog = createDialogElement(settings);

  let header;
  if (settings.showTitlebar) {
    header = createHeaderElement(settings);
    dialog.appendChild(header);
  }

  const content = createContentWrapperElement(settings);
  dialog.appendChild(content);

  return { dialog, header, content };
};

export default mdwindow;

const createDialogElement = settings => {
  const compiledTemplate = Hogan.compile(settings.dialogTemplate);
  const html = compiledTemplate.render({
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
