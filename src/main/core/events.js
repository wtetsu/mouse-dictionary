/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import config from "./config";
import rule from "./rule";
import Lookuper from "./lookuper";
import traverser from "../lib/traverser";
import utils from "../lib/utils";
import Draggable from "../lib/draggable";

const POSITION_FIELDS = ["left", "top", "width", "height"];

const attach = async (settings, dialog, doUpdateContent) => {
  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, doUpdateContent);

  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles);
  draggable.onchange = (e) => config.savePosition(e);
  draggable.add(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", (e) => {
    draggable.onMouseUp();
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
};

export default { attach };
