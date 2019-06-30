/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import config from "./config";
import atcursor from "../lib/atcursor";
import dom from "../lib/dom";
import utils from "../lib/utils";
import storage from "../lib/storage";
import ShortCache from "../lib/shortcache";
import generateEntries from "../lib/entry/generate";
import ContentGenerator from "./contentgenerator";
import Draggable from "./draggable";

const TEXT_LENGTH_LIMIT = 128;
const POSITION_FIELDS = ["left", "top", "width", "height"];

const attach = (settings, dialog, doUpdateContent) => {
  const controller = new LookupController(settings, doUpdateContent);

  const scrollable = settings.scroll === "scroll";
  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles, scrollable);
  draggable.onchange = e => config.savePosition(e);
  draggable.add(dialog);

  document.body.addEventListener("mousedown", () => {
    controller.suspended = true;
  });

  document.body.addEventListener("mouseup", e => {
    draggable.onMouseUp();
    controller.suspended = false;
    controller.setSelectedText(getSelection());

    const range = utils.omap(dialog.style, utils.convertToInt, POSITION_FIELDS);
    const didMouseUpOnTheWindow = utils.isInsideRange(range, { x: e.clientX, y: e.clientY });
    controller.halfLocked = didMouseUpOnTheWindow;
  });

  document.body.addEventListener("mousemove", e => {
    draggable.onMouseMove(e);
    if (!controller.canUpdate()) {
      return;
    }
    const textAtCursor = atcursor(e.target, e.clientX, e.clientY, settings.parseWordsLimit);
    controller.update(textAtCursor, false, true);
  });

  chrome.runtime.onMessage.addListener(request => {
    const m = request.message;
    switch (m.type) {
      case "text":
        controller.update(m.text, m.mustIncludeOriginalText, m.enableShortWord);
        break;
      case "mousemove":
        draggable.onMouseMove(m);
        break;
      case "mouseup":
        draggable.onMouseUp();
        break;
    }
  });

  // First invoke
  controller.setSelectedText(getSelection());
};

class LookupController {
  constructor(settings, doUpdateContent) {
    this.lookupWithCapitalized = settings.lookupWithCapitalized;
    this.doUpdateContent = doUpdateContent;

    this.lastText = null;
    this.suspended = false;
    this.halfLocked = false;
    this.textLengthLimit = TEXT_LENGTH_LIMIT;

    // Compile templates, regular expressions so that it works fast
    this.contentGenerator = new ContentGenerator(settings);
    const cacheSize = process.env.NODE_ENV === "production" ? 100 : 0;
    this.shortCache = new ShortCache(cacheSize);
  }

  canUpdate() {
    if (this.suspended) {
      return false;
    }
    if (this.halfLocked && this.selectedText) {
      return false;
    }
    if (!this.halfLocked && getSelection()) {
      return false;
    }
    return true;
  }

  async update(rawText, includeOriginalText, enableShortWord) {
    if (!rawText) {
      return;
    }
    const textToLookup = rawText.substring(0, this.textLengthLimit);
    if (!textToLookup) {
      return;
    }

    if (!includeOriginalText) {
      if (this.lastText === textToLookup) {
        return;
      }
      const cacheData = this.shortCache.get(textToLookup);
      if (cacheData) {
        this.updateContent(cacheData.dom, cacheData.hitCount);
        this.lastText = textToLookup;
        return;
      }
    }
    await this.lookupAndUpdate(textToLookup, includeOriginalText, enableShortWord);
  }

  async lookupAndUpdate(textToLookup, includeOrgText, enableShortWord) {
    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }

    const { entries, lang } = generateEntries(textToLookup, this.lookupWithCapitalized, includeOrgText);
    const descriptions = await storage.local.get(entries);
    const { html, hitCount } = this.contentGenerator.generate(entries, descriptions, enableShortWord && lang === "en");
    const newDom = dom.create(html);

    this.updateContent(newDom, hitCount);

    this.shortCache.put(textToLookup, { dom: newDom, hitCount });
    this.lastText = textToLookup;

    if (process.env.NODE_ENV !== "production") {
      const time = new Date().getTime() - startTime;
      console.info(`${time}ms:${textToLookup}`);
      console.info(entries);
    }
  }

  updateContent(newDom, hitCount) {
    if (hitCount === 0) {
      return;
    }
    this.doUpdateContent(newDom, hitCount);
  }

  setSelectedText(selectedText) {
    this.selectedText = selectedText;
    if (selectedText) {
      this.update(selectedText, true, false);
    }
  }
}

const getSelection = () => {
  const selection = window.getSelection();
  const str = selection.toString().trim();
  return str.substring(0, TEXT_LENGTH_LIMIT);
};

export default { attach };
