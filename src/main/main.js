/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import res from "./resources";
import dom from "../lib/dom";
import env from "../settings/env";
import mdwindow from "./mdwindow";
import loader from "./settingsloader";
import events from "./events";
import Draggable from "./draggable";

const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";

const main = async () => {
  // Pages which have frames are not supported.
  if (isFramePage()) {
    alert(res("doesntSupportFrame"));
    return;
  }

  const userSettings = await loader.loadInitialSettings();

  let existingElement = document.getElementById(DIALOG_ID);
  if (existingElement) {
    toggleDialog(existingElement, userSettings);
    return;
  }

  await initialize(userSettings);
};

const isFramePage = () => {
  const frames = document.getElementsByTagName("frame");
  return frames && frames.length >= 1;
};

const toggleDialog = (area, userSettings) => {
  const isHidden = area.getAttribute("data-mouse-dictionary-hidden");
  if (isHidden === "true") {
    dom.applyStyles(area, userSettings.normalDialogStyles);
    area.setAttribute("data-mouse-dictionary-hidden", "false");
  } else {
    dom.applyStyles(area, userSettings.hiddenDialogStyles);
    area.setAttribute("data-mouse-dictionary-hidden", "true");
  }
};

const initialize = async userSettings => {
  const area = mdwindow.create(userSettings);
  area.dialog.id = DIALOG_ID;

  dom.applyStyles(area.dialog, userSettings.hiddenDialogStyles);
  document.body.appendChild(area.dialog);

  const positions = await loader.loadInitialPosition({
    type: userSettings.initialPosition,
    dialogWidth: area.dialog.clientWidth,
    dialogHeight: area.dialog.clientHeight
  });
  dom.applyStyles(area.dialog, positions);
  dom.applyStyles(area.dialog, userSettings.normalDialogStyles);

  const draggable = new Draggable(userSettings.normalDialogStyles, userSettings.movingDialogStyles);
  if (!env.disableKeepingWindowStatus) {
    draggable.onchange = e => loader.savePosition(e);
  }
  draggable.add(area.dialog);

  events.attach(area.dialog, draggable, userSettings, (newDom, count) => {
    // update contents
    if (draggable.selectable && count === 0) {
      return;
    }
    area.content.innerHTML = "";
    area.content.appendChild(newDom);
  });
};

main();
