/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import res from "./resource";
import rule from "./rule";
import view from "./view";
import config from "./config";
import events from "./events";
import dom from "../lib/dom";
import utils from "../lib/utils";
import storage from "../lib/storage";

const main = async () => {
  console.time("launch");
  await invoke();
  console.timeEnd("launch");
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
    // Doesn't support frame pages
    alert(res("doesntSupportFrame"));
    return;
  }

  const { settings, position } = await config.loadAll();

  if (location.href.endsWith(".pdf")) {
    const toContinue = settings.skipPdfConfirmation || confirm(res("continueProcessingPdf"));
    if (!toContinue) {
      return;
    }
    invokePdfReader();
    return;
  }

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

const processSecondOrLaterLaunch = async (existingElement) => {
  const userSettings = await config.loadSettings();
  toggleDialog(existingElement, userSettings);
};

const isFramePage = () => {
  const frames = document.getElementsByTagName("frame");
  return frames?.length >= 1;
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

  // Async
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

const setEvents = async (area, userSettings) => {
  let doUpdate = (newDom) => dom.replace(area.content, newDom);

  events.attach(userSettings, area.dialog, (newDom) => doUpdate(newDom));

  const isDataReady = await config.isDataReady();
  if (isDataReady) {
    return;
  }
  // Notice for the very first launch.
  const notice = dom.create(`<span>${res("needToPrepareDict")}</span>`);
  dom.replace(area.content, notice);
  doUpdate = async () => {
    if (!(await config.isDataReady())) {
      return;
    }
    doUpdate = (newDom) => dom.replace(area.content, newDom);
  };
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

const invokePdfReader = async () => {
  const [updateRibbon, closeRibbon] = createRibbon();

  updateRibbon(res("downloadingPdf"));

  const r = await fetch(location.href);

  if (r.status !== 200) {
    updateRibbon(await r.text());
    return;
  }

  updateRibbon(res("preparingPdf"));

  const base64data = convertToBase64(await r.arrayBuffer());
  await storage.local.set({ "**** pdf_data ****": base64data, "**** pdf ****": "1" });

  sendMessage({ type: "open_pdf" });
  closeRibbon();
};

const createRibbon = () => {
  const line = dom.create(
    '<div style="position:absolute;width:100%;bottom:0;background-color:black;opacity:0.75;color:#FFFFFF;text-align:center;font-size:x-large;"></div>'
  );

  const progress = dom.create('<span style=""></span>');
  const indicator = dom.create('<span style="position:absolute;text-align:center;"></span>');

  const indicators = ["⠿", "⠿", "⠿", "⠷", "⠯", "⠟", "⠻", "⠽", "⠾"];
  let indicatorCount = 0;
  const intervalId = setInterval(() => {
    indicator.textContent = indicators[indicatorCount % indicators.length];
    indicatorCount++;
  }, 150);

  line.appendChild(progress);
  line.appendChild(indicator);
  document.body.appendChild(line);

  const doUpdate = (text) => {
    progress.textContent = text;
  };
  const doClose = () => {
    line.parentNode.removeChild(line);
    clearInterval(intervalId);
  };
  return [doUpdate, doClose];
};

const convertToBase64 = (arrayBuffer) => {
  let result = "";
  const byteArray = new Uint8Array(arrayBuffer);

  for (let i = 0; ; i++) {
    if (i * 1023 >= byteArray.length) {
      break;
    }
    const start = i * 1023;
    const end = (i + 1) * 1023;

    const slice = byteArray.slice(start, end);
    const base64slice = btoa(String.fromCharCode(...slice));

    result += base64slice;
  }
  return result;
};

const sendMessage = (message) => {
  return new Promise((done) => {
    chrome.runtime.sendMessage(message, () => {
      done();
    });
  });
};

main();
