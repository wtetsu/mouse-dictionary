/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import atcursor from "../lib/atcursor";
import text from "../lib/text";
import dom from "../lib/dom";
import ShortCache from "../lib/shortcache";
import storage from "../lib/storage";
import ContentGenerator from "./contentgenerator";

export default {
  attach(dialog, draggable, settings, updateContent) {
    let _selection = null;
    let _mouseDown = false;
    let _isLastMouseUpOnTheWindow = false;

    const TEXT_LENGTH_LIMIT = 128;

    // Compile templates, regular expressions so that it works fast
    let _contentGenerator;
    try {
      _contentGenerator = new ContentGenerator(settings);
    } catch (e) {
      _contentGenerator = null;
      console.error(e);
    }

    document.body.addEventListener("mousedown", () => {
      _mouseDown = true;
    });

    document.body.addEventListener("mouseup", e => {
      draggable.onMouseUp();

      _mouseDown = false;
      _selection = window.getSelection().toString();
      if (_selection) {
        const text = _selection.trim().substring(0, TEXT_LENGTH_LIMIT);
        parseTextAndLookup(text, true, false);
      }
      _isLastMouseUpOnTheWindow = isOnTheWindow(dialog.style, e);
    });

    document.body.addEventListener("mousemove", e => {
      draggable.onMouseMove(e);

      if (_mouseDown) {
        return;
      }
      if (_isLastMouseUpOnTheWindow && _selection) {
        return;
      }
      if (!_isLastMouseUpOnTheWindow && window.getSelection().toString()) {
        return;
      }
      let textAtCursor = atcursor(e.target, e.clientX, e.clientY, settings.parseWordsLimit);
      if (!textAtCursor) {
        return;
      }
      parseTextAndLookup(textAtCursor, false, true);
    });

    chrome.runtime.onMessage.addListener(request => {
      const m = request.message;
      switch (m.type) {
        case "text":
          parseTextAndLookup(m.text, m.mustIncludeOriginalText, m.enableShortWord);
          break;
        case "mousemove":
          draggable.onMouseMove(m);
          break;
        case "mouseup":
          draggable.onMouseUp();
          break;
      }
    });

    let _lastText = null;
    const _shortCache = new ShortCache(100);

    const parseTextAndLookup = async (rawTextToLookup, mustIncludeOriginalText, enableShortWord) => {
      const textToLookup = rawTextToLookup.substring(0, TEXT_LENGTH_LIMIT);
      if (!mustIncludeOriginalText) {
        if (!textToLookup || _lastText === textToLookup) {
          return;
        }
        const cacheData = _shortCache.get(textToLookup);
        if (cacheData) {
          updateContent(cacheData.dom, cacheData.hitCount);
          _lastText = textToLookup;
          return;
        }
      }

      let startTime;
      if (process.env.NODE_ENV !== "production") {
        startTime = new Date().getTime();
      }

      const wordsToLookup = text.createLookupWords(textToLookup, settings.lookupWithCapitalized, mustIncludeOriginalText);
      const descriptions = await storage.local.get(wordsToLookup);
      const { html, hitCount } = _contentGenerator.generate(wordsToLookup, descriptions, enableShortWord);
      const newDom = dom.create(html);
      updateContent(newDom, hitCount);

      _shortCache.put(textToLookup, { dom: newDom, hitCount });
      _lastText = textToLookup;

      if (process.env.NODE_ENV !== "production") {
        const time = new Date().getTime() - startTime;
        console.info(`${time}ms:${textToLookup}`);
        console.info(wordsToLookup);
      }
    };
  }
};

const isOnTheWindow = (style, e) => {
  const top = parseInt(style.top, 10);
  const left = parseInt(style.left, 10);
  const width = parseInt(style.width, 10);
  const height = parseInt(style.height, 10);
  return e.clientX >= left && e.clientX <= left + width && (e.clientY >= top && e.clientY <= top + height);
};
