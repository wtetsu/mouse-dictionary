/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import Draggable from "../lib/draggable";
import sound from "../lib/sound";
import traverser from "../lib/traverser";
import utils from "../lib/utils";
import config from "./config";
import entryDefault from "./entry/default";
import Lookuper from "./lookuper";
import rule from "./rule";

const POSITION_FIELDS = ["left", "top", "width", "height"];

const attach = async (settings, dialog, doUpdateContent) => {
  let enableDefault = true;

  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, entryDefault(), doUpdateContent);

  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles);
  draggable.events.change = (e) => config.savePosition(e);
  draggable.add(dialog);

  setDialogEvents(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", async (e) => {
    draggable.onMouseUp(e);
    lookuper.suspended = false;

    const updated = await lookuper.aimedLookup(utils.getSelection());
    if (updated) {
      draggable.resetScroll();
    }

    const range = utils.omap(dialog.style, utils.convertToInt, POSITION_FIELDS);
    const didMouseUpOnTheWindow = utils.isInsideRange(range, {
      x: e.clientX,
      y: e.clientY,
    });
    lookuper.halfLocked = didMouseUpOnTheWindow;
  });

  const onMouseMoveFirst = async (e) => {
    // Wait until rule loading finish
    await rule.load();

    onMouseMove = onMouseMoveSecondOrLater;
    onMouseMove(e);
  };

  const onMouseMoveSecondOrLater = async (e) => {
    draggable.onMouseMove(e);
    if (enableDefault) {
      const textList = traverse(e.target, e.clientX, e.clientY);
      const updated = await lookuper.lookupAll(textList);
      if (updated) {
        draggable.resetScroll();
      }
    }
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
      case "enable_default":
        enableDefault = true;
        break;
      case "disable_default":
        enableDefault = false;
        break;
      case "scroll_up":
        draggable.scroll(-50);
        break;
      case "scroll_down":
        draggable.scroll(50);
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

const setDialogEvents = (dialog) => {
  dialog.addEventListener("mouseenter", (e) => {
    e.target.querySelectorAll("[data-md-pronunciation]").forEach((elem) => {
      if (elem.dataset.mdPronunciationSet) {
        return;
      }
      elem.dataset.mdPronunciationSet = "true";
      elem.addEventListener("click", () => sound.pronounce(elem.dataset.mdPronunciation));
    });
    e.target.querySelectorAll("[data-md-hovervisible]").forEach((elem) => {
      elem.style.visibility = "visible";
    });
  });
  dialog.addEventListener("mouseleave", (e) => {
    e.target.querySelectorAll("[data-md-hovervisible]").forEach((elem) => {
      elem.style.visibility = "hidden";
    });
  });
};

const createSnapGuideElement = () => {
  const guideElement = dom.create("<div>Shift+Move: Smart-snap</div");
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
