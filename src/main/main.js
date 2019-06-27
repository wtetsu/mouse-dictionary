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
import storage from "../lib/storage";

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
  const userSettings = await loader.loadInitialSettings();
  await initialize(userSettings);
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

const initialize = async userSettings => {
  let area;
  try {
    area = mdwindow.create(userSettings);
  } catch (e) {
    alert(e.message);
    console.error(e);
    return;
  }

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

  const scrollable = userSettings.scroll === "scroll";
  const draggable = new Draggable(userSettings.normalDialogStyles, userSettings.movingDialogStyles, scrollable);
  if (!env.disableKeepingWindowStatus) {
    draggable.onchange = e => loader.savePosition(e);
  }
  draggable.add(area.dialog);

  let canRefreshView = true;
  events.attach(area.dialog, draggable, userSettings, (newDom, count) => {
    if (!canRefreshView) {
      storage.local.pickOut(KEY_LOADED).then(isLoaded => {
        if (isLoaded) {
          canRefreshView = true;
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

  const isLoaded = await storage.local.pickOut(KEY_LOADED);
  if (!isLoaded) {
    area.content.innerHTML = res("needToPrepareDict");
    canRefreshView = false;
  }
};

main();
