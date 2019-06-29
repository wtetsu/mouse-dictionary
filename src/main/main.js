/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import res from "./resources";
import dom from "../lib/dom";
import rule from "../lib/rule";
import env from "../settings/env";
import view from "./view";
import loader from "./settingsloader";
import events from "./events";
import Draggable from "./draggable";
import storage from "../lib/storage";
import utils from "../lib/utils";

const KEY_LOADED = "**** loaded ****";

const main = async () => {
  let startTime;
  if (process.env.NODE_ENV !== "production") {
    startTime = new Date().getTime();
  }

  await invoke();

  if (process.env.NODE_ENV !== "production") {
    const time = new Date().getTime() - startTime;
    console.info(`Launch:${time}ms`);
  }
};

const invoke = async () => {
  const existingElement = document.getElementById(DIALOG_ID);
  if (!existingElement) {
    await processFirstLaunch();
  } else {
    await processSecondOrLaterLaunch(existingElement);
  }
};

const processFirstLaunch = async () => {
  if (isFramePage()) {
    // Pages which have frames are not supported.
    alert(res("doesntSupportFrame"));
    return;
  }
  const { settings, position } = await loader.load();
  try {
    initialize(settings, position);
  } catch (e) {
    alert(e.message);
    console.error(e);
    return;
  }

  // Lazy load
  rule.load();
};

const processSecondOrLaterLaunch = async existingElement => {
  const userSettings = await loader.loadInitialSettings();
  toggleDialog(existingElement, userSettings);
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

const initialize = (userSettings, storedPosition) => {
  const area = view.create(userSettings);
  area.dialog.id = DIALOG_ID;
  dom.applyStyles(area.dialog, userSettings.hiddenDialogStyles);
  document.body.appendChild(area.dialog);

  const newStyles = decideInitialStyles(userSettings, storedPosition, area.dialog.clientWidth);
  dom.applyStyles(area.dialog, newStyles);
  setEvents(area, userSettings);
};

const decideInitialStyles = (userSettings, storedPosition, dialogWidth) => {
  let newPosition;
  if (userSettings.initialPosition === "keep") {
    newPosition = utils.optimizeInitialPosition(storedPosition);
  } else {
    newPosition = getInitialPosition(userSettings.initialPosition, dialogWidth);
  }
  const positionStyles = utils.convertToStyles(newPosition);
  const newStyles = Object.assign(positionStyles, userSettings.normalDialogStyles);
  return newStyles;
};

const setEvents = (area, userSettings) => {
  const scrollable = userSettings.scroll === "scroll";
  const draggable = new Draggable(userSettings.normalDialogStyles, userSettings.movingDialogStyles, scrollable);
  if (!env.disableKeepingWindowStatus) {
    draggable.onchange = e => loader.savePosition(e);
  }
  draggable.add(area.dialog);

  let _canRefreshView = true;
  events.attach(area.dialog, draggable, userSettings, (newDom, count) => {
    if (!_canRefreshView) {
      storage.local.pickOut(KEY_LOADED).then(isLoaded => {
        if (isLoaded) {
          _canRefreshView = true;
        }
      });
      return;
    }
    // update contents
    if (draggable.selectable && count === 0) {
      return;
    }
    area.content.innerHTML = "";
    area.content.appendChild(newDom);
  });

  // Async
  storage.local.pickOut(KEY_LOADED).then(isLoaded => {
    if (!isLoaded) {
      area.content.innerHTML = res("needToPrepareDict");
      _canRefreshView = false;
    }
  });
};

const EDGE_SPACE = 5;

const getInitialPosition = (type, dialogWidth) => {
  const position = {};
  switch (type) {
    case "right":
      position.left = document.documentElement.clientWidth - dialogWidth - EDGE_SPACE;
      break;
    case "left":
      position.left = EDGE_SPACE;
      break;
  }
  return position;
};

main();
