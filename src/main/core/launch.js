/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import utils from "../lib/utils";
import config from "./config";
import events from "./events";
import pdf from "./pdf";
import res from "./resource";
import rule from "./rule";
import view from "./view";

const SHADOW_HOST_ID = `${DIALOG_ID}_SH`;

export default async () => {
  const existingDialog = findExistingDialog();
  if (!existingDialog) {
    await processFirstLaunch();
  } else {
    await processSecondOrLaterLaunch(existingDialog);
  }
};

const findExistingDialog = () => {
  // Try to find the dialog in the shadow DOM first
  const host = document.getElementById(SHADOW_HOST_ID);
  if (host?.shadowRoot) {
    return host.shadowRoot.getElementById(DIALOG_ID);
  }
  // If not found in shadow DOM, check the main document
  return document.getElementById(DIALOG_ID);
};

const processFirstLaunch = async () => {
  if (isFramePage()) {
    // Doesn't support frame pages
    alert(res("doesntSupportFrame"));
    return;
  }

  const { settings, position } = await config.loadAll();

  if (onPdfDocument(location.href, settings.pdfUrl)) {
    launchPdfViewer(settings);
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

const launchPdfViewer = (settings) => {
  const toContinue = settings.skipPdfConfirmation || confirm(res("continueProcessingPdf"));
  if (!toContinue) {
    return;
  }
  try {
    pdf.invoke();
  } catch (e) {
    alert(e.message);
    console.error(e);
  }
};

const onPdfDocument = (url, pdfUrlPattern) => {
  if (!pdfUrlPattern) {
    return isOnPdfDocument();
  }

  try {
    const re = new RegExp(pdfUrlPattern);
    return re.test(url);
  } catch (error) {
    console.error(error);
  }
  return false;
};

const isOnPdfDocument = () => {
  if (document.contentType === "application/pdf") {
    return true;
  }

  // Traditional logic
  const e = document.body?.children?.[0];
  const embedPdf = e?.tagName === "EMBED" && e?.type === "application/pdf";
  if (embedPdf) {
    return true;
  }

  return false;
};

const processSecondOrLaterLaunch = async (existingElement) => {
  const userSettings = await config.loadSettings();
  toggleDialog(existingElement, userSettings);
};

const isFramePage = () => {
  const frames = document.getElementsByTagName("FRAME");
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

  if (useShadowDom(userSettings)) {
    const shadowHost = createShadowRoot(area.dialog);
    document.body.appendChild(shadowHost);
  } else {
    document.body.appendChild(area.dialog);
  }

  const newStyles = decideInitialStyles(userSettings, storedPosition, area.dialog.clientWidth);
  dom.applyStyles(area.dialog, newStyles);

  // Async
  setEvents(area, userSettings);
};

const createShadowRoot = (dialog) => {
  const shadowHost = document.createElement("div");
  shadowHost.id = SHADOW_HOST_ID;
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      display: block;
    }
    * {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      line-height: normal;
      box-sizing: border-box;
      text-shadow: none;
      vertical-align: baseline;
    }
  `;
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(dialog);

  return shadowHost;
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

  events
    .attach(userSettings, area.dialog, (newDom) => doUpdate(newDom))
    .catch((e) => {
      console.error(e);
      alert(e.message);
    });

  const isDataReady = await config.isDataReady();
  if (isDataReady) {
    return;
  }
  // Notice for the very first launch.
  const notice = dom.create(
    `<span style="font-size: 1.3rem; font-family: 'hiragino kaku gothic pro', meiryo, sans-serif;">${res("needToPrepareDict")}</span>`,
  );

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

const useShadowDom = (settings) => {
  if (settings?.domType === "light") {
    return false;
  }
  // true by default
  return true;
};
