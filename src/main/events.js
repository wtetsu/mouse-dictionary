/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import atcursor from "../lib/atcursor";
import config from "./config";
//import env from "../settings/env";
import dom from "../lib/dom";
import utils from "../lib/utils";
import ShortCache from "../lib/shortcache";
import storage from "../lib/storage";
import generateEntries from "../lib/entry/generate";
import ContentGenerator from "./contentgenerator";
import Draggable from "./draggable";

const TEXT_LENGTH_LIMIT = 128;

const attach = (settings, dialog, updateContent) => {
  const controller = new Controller(settings, dialog, updateContent);

  controller._selection = getSelection();

  //let _selection = getSelection();
  //let _mouseDown = false;
  //let _isLastMouseUpOnTheWindow = false;

  const scrollable = settings.scroll === "scroll";
  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles, scrollable);
  draggable.onchange = e => config.savePosition(e);
  draggable.add(dialog);

  document.body.addEventListener("mousedown", () => {
    controller._mouseDown = true;
  });

  document.body.addEventListener("mouseup", e => {
    draggable.onMouseUp();
    controller._mouseDown = false;

    // controller._selection = getSelection();
    // if (controller._selection) {
    //   controller.parseTextAndLookup(controller._selection, true, false);
    // }

    controller.setSelectedText(getSelection());
    const range = utils.omap(dialog.style, utils.convertToInt, ["top", "left", "width", "height"]);
    controller._isLastMouseUpOnTheWindow = utils.isInsideRange(range, { x: e.clientX, y: e.clientY });
  });

  document.body.addEventListener("mousemove", e => {
    draggable.onMouseMove(e);
    // if (_mouseDown) {
    //   return;
    // }
    // if (controller._isLastMouseUpOnTheWindow && controller._selection) {
    //   return;
    // }
    // if (!controller._isLastMouseUpOnTheWindow && getSelection()) {
    //   return;
    // }
    // let textAtCursor = atcursor(e.target, e.clientX, e.clientY, settings.parseWordsLimit);
    // if (!textAtCursor) {
    //   return;
    // }
    // controller.parseTextAndLookup(textAtCursor, false, true, settings.lookupWithCapitalized);
    controller.update(e, false, true);
  });

  chrome.runtime.onMessage.addListener(request => {
    const m = request.message;
    switch (m.type) {
      case "text":
        controller.parseTextAndLookup(m.text, m.mustIncludeOriginalText, m.enableShortWord);
        break;
      case "mousemove":
        draggable.onMouseMove(m);
        break;
      case "mouseup":
        draggable.onMouseUp();
        break;
    }
  });

  // first invoke
  if (controller._selection) {
    //const text = _selection.trim().substring(0, TEXT_LENGTH_LIMIT);
    controller.parseTextAndLookup(controller._selection, true, false);
  }
};

const getSelection = () => {
  const selection = window.getSelection();
  const str = selection.toString().trim();
  return str.substring(0, TEXT_LENGTH_LIMIT);
};

class Controller {
  constructor(settings, dialog, fnUpdateContent) {
    this._lastText = null;
    const cacheSize = process.env.NODE_ENV === "production" ? 100 : 0;
    this._shortCache = new ShortCache(cacheSize);
    this.updateContent = fnUpdateContent;
    this._mouseDown = false;
    this.lookupWithCapitalized = settings.lookupWithCapitalized;
    this.parseWordsLimit = settings.parseWordsLimit;

    // Compile templates, regular expressions so that it works fast
    try {
      this._contentGenerator = new ContentGenerator(settings);
    } catch (e) {
      this._contentGenerator = null;
      console.error(e);
    }
  }

  async update(e, includeOrgText, enableShortWord) {
    if (this._mouseDown) {
      return;
    }
    if (this._isLastMouseUpOnTheWindow && this._selection) {
      return;
    }
    if (!this._isLastMouseUpOnTheWindow && getSelection()) {
      return;
    }
    let textAtCursor = atcursor(e.target, e.clientX, e.clientY, this.parseWordsLimit);
    if (!textAtCursor) {
      return;
    }

    this.parseTextAndLookup(textAtCursor, includeOrgText, enableShortWord);
  }

  async parseTextAndLookup(rawText, includeOrgText, enableShortWord) {
    const textToLookup = rawText.substring(0, TEXT_LENGTH_LIMIT);
    if (!includeOrgText) {
      if (!textToLookup || this._lastText === textToLookup) {
        return;
      }
      const cacheData = this._shortCache.get(textToLookup);
      if (cacheData) {
        this.updateContent(cacheData.dom, cacheData.hitCount);
        this._lastText = textToLookup;
        return;
      }
    }

    await this.aaa(textToLookup, includeOrgText, enableShortWord);
  }

  async aaa(textToLookup, includeOrgText, enableShortWord) {
    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }

    const { entries, lang } = generateEntries(textToLookup, this.lookupWithCapitalized, includeOrgText);
    const descriptions = await storage.local.get(entries);
    const { html, hitCount } = this._contentGenerator.generate(entries, descriptions, enableShortWord && lang === "en");
    const newDom = dom.create(html);
    this.updateContent(newDom, hitCount);

    this._shortCache.put(textToLookup, { dom: newDom, hitCount });
    this._lastText = textToLookup;

    if (process.env.NODE_ENV !== "production") {
      const time = new Date().getTime() - startTime;
      console.info(`${time}ms:${textToLookup}`);
      console.info(entries);
    }
  }

  setSelectedText(selectedText) {
    this._selection = selectedText;
    if (selectedText) {
      this.parseTextAndLookup(selectedText, true, false);
    }
  }
}

export default { attach };
