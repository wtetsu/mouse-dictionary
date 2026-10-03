/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import Draggable from "../lib/draggable";
import sound from "../lib/sound";
import traverser from "../lib/traverser";
import type { Rect } from "../lib/utils";
import utils from "../lib/utils";
import type { DialogStyles, ParsedSettings } from "../types";
import config from "./config";
import entryDefault from "./entry/default";
import type { UpdateContent } from "./lookuper";
import Lookuper from "./lookuper";
import rule from "./rule";

const POSITION_FIELDS = ["left", "top", "width", "height"];

// Messages sent from other extensions (via background) or the background itself
type Message = {
  type?: string;
  text?: string;
  withCapitalized?: boolean;
  mustIncludeOriginalText?: boolean;
  enableShortWord?: boolean;
};

const attach = async (settings: ParsedSettings, dialog: HTMLElement, doUpdateContent: UpdateContent): Promise<void> => {
  let enableDefault = true;

  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, entryDefault(), doUpdateContent);

  const draggable = new Draggable(
    settings.normalDialogStyles as DialogStyles,
    settings.movingDialogStyles as DialogStyles,
  );
  draggable.events.change = (e) => config.savePosition(e);
  draggable.add(dialog);

  setDialogEvents(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", async (e) => {
    draggable.onMouseUp();
    lookuper.suspended = false;

    const updated = await lookuper.aimedLookup(utils.getSelection());
    if (updated) {
      draggable.resetScroll();
    }

    const range = utils.omap(
      dialog.style as unknown as Record<string, string>,
      utils.convertToInt,
      POSITION_FIELDS,
    ) as Rect;
    const didMouseUpOnTheWindow = utils.isInsideRange(range, {
      x: e.clientX,
      y: e.clientY,
    });
    lookuper.halfLocked = didMouseUpOnTheWindow;
  });

  const onMouseMoveFirst = async (e: MouseEvent): Promise<void> => {
    // Wait until rule loading finish
    await rule.load();

    onMouseMove = onMouseMoveSecondOrLater;
    onMouseMove(e);
  };

  const onMouseMoveSecondOrLater = async (e: MouseEvent): Promise<void> => {
    draggable.onMouseMove(e);
    if (enableDefault) {
      const textList = traverse(e.target as HTMLElement, e.clientX, e.clientY);
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
      draggable.activateSnap();
    }
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      draggable.deactivateSnap();
    }
  });

  chrome.runtime.onMessage.addListener((request) => {
    const m: Message | undefined = request.message;
    switch (m?.type) {
      case "text":
        lookuper.update(
          m.text as string,
          m.withCapitalized as boolean,
          m.mustIncludeOriginalText as boolean,
          m.enableShortWord as boolean,
        );
        break;
      case "mousemove":
        // The message carries mouse coordinates like a MouseEvent
        draggable.onMouseMove(m as unknown as MouseEvent);
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
  let snapGuide: HTMLElement | null = null;
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

const setDialogEvents = (dialog: HTMLElement): void => {
  dialog.addEventListener("mouseenter", (e) => {
    const target = e.target as HTMLElement;
    for (const elem of target.querySelectorAll<HTMLElement>("[data-md-pronunciation]")) {
      if (elem.dataset.mdPronunciationSet) {
        continue;
      }
      elem.dataset.mdPronunciationSet = "true";
      elem.addEventListener("click", () => sound.pronounce(elem.dataset.mdPronunciation as string));
    }
    for (const elem of target.querySelectorAll<HTMLElement>("[data-md-hovervisible]")) {
      elem.style.visibility = "visible";
    }
  });
  dialog.addEventListener("mouseleave", (e) => {
    for (const elem of (e.target as HTMLElement).querySelectorAll<HTMLElement>("[data-md-hovervisible]")) {
      elem.style.visibility = "hidden";
    }
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
