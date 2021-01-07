/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import config from "./config";
import rule from "./rule";
import Lookuper from "./lookuper";
import dom from "../lib/dom";
import traverser from "../lib/traverser";
import utils from "../lib/utils";
import Draggable from "../lib/draggable";

const POSITION_FIELDS = ["left", "top", "width", "height"];

const attach = async (settings, dialog, doUpdateContent) => {
  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, doUpdateContent);

  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles);
  draggable.events.change = (e) => config.savePosition(e);
  draggable.add(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", (e) => {
    draggable.onMouseUp(e);
    lookuper.suspended = false;
    lookuper.aimedLookup(utils.getSelection());

    const range = utils.omap(dialog.style, utils.convertToInt, POSITION_FIELDS);
    const didMouseUpOnTheWindow = utils.isInsideRange(range, { x: e.clientX, y: e.clientY });
    lookuper.halfLocked = didMouseUpOnTheWindow;
  });

  const onMouseMoveFirst = async (e) => {
    // Wait until rule loading finish
    await rule.load();

    onMouseMove = onMouseMoveSecondOrLater;
    onMouseMove(e);
  };

  const onMouseMoveSecondOrLater = (e) => {
    draggable.onMouseMove(e);
    const textList = traverse(e.target, e.clientX, e.clientY);
    lookuper.lookupAll(textList);
  };
  let onMouseMove = onMouseMoveFirst;
  document.body.addEventListener("mousemove", (e) => onMouseMove(e));

  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      draggable.activateSnap(e);
    }
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      draggable.deactivateSnap(e);
    }
  });

  chrome.runtime.onMessage.addListener((request) => {
    const m = request.message;
    switch (m?.type) {
      case "text":
        lookuper.update(m.text, m.withCapitalized, m.mustIncludeOriginalText, m.enableShortWord);
        break;
      case "mousemove":
        draggable.onMouseMove(m);
        break;
      case "mouseup":
        draggable.onMouseUp();
        break;
    }
  });

  const selectedText = utils.getSelection();
  if (selectedText) {
    // Wait until rule loading finish
    await rule.load();
    // First invoke
    lookuper.aimedLookup(selectedText);
  }

  // Guide handling
  let snapGuide = null;
  draggable.events.move = () => {
    if (snapGuide) {
      return;
    }
    snapGuide = createSnapGuideElement();
    dialog.appendChild(snapGuide);
  };
  draggable.events.finish = () => {
    if (!snapGuide) {
      return;
    }
    snapGuide.remove();
    snapGuide = null;
  };
};

const createSnapGuideElement = () => {
  const guideElement = dom.create(`<div>Shift+Move: Smart-snap</div>`);
  dom.applyStyles(guideElement, {
    right: "0px",
    top: "0px",
    position: "absolute",
    color: "#FFFFFF",
    backgroundColor: "#4169e1",
    fontSize: "small",
    opacity: "0.90",
    margin: "4px",
    padding: "3px",
    borderRadius: "5px 5px 5px 5px",
  });
  return guideElement;
};

export default { attach };
