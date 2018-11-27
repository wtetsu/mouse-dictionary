/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import atcursor from "./atcursor";
import text from "./text";
import dom from "./dom";
import ContentGenerator from "./contentgenerator";
import ShortCache from "./shortcache";

export default {
  attach(dialog, settings, updateContent) {
    let _selection = null;
    let _mouseDown = false;
    let _isLastMouseUpOnTheWindow = false;

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
      _mouseDown = false;
      _selection = window.getSelection().toString();
      if (_selection) {
        const SELECTION_LENGTH_LIMIT = 128;
        const text = _selection.trim().substring(0, SELECTION_LENGTH_LIMIT);
        parseTextAndLookup(text, true, false);
      }

      //const s = _area.dialog.style;
      const s = dialog.style;
      const top = parseInt(s.top, 10);
      const left = parseInt(s.left, 10);
      const width = parseInt(s.width, 10);
      const height = parseInt(s.height, 10);
      if (e.clientX >= left && e.clientX <= left + width && (e.clientY >= top && e.clientY <= top + height)) {
        _isLastMouseUpOnTheWindow = true;
      } else {
        _isLastMouseUpOnTheWindow = false;
      }
    });

    document.body.addEventListener("mousemove", ev => {
      if (_mouseDown) {
        return;
      }
      if (_isLastMouseUpOnTheWindow && _selection) {
        return;
      }
      if (!_isLastMouseUpOnTheWindow && window.getSelection().toString()) {
        return;
      }
      let textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY, settings.parseWordsLimit);
      if (!textAtCursor) {
        return;
      }
      parseTextAndLookup(textAtCursor, false, true);
    });

    let _lastText = null;
    const _shortCache = new ShortCache(100);

    const parseTextAndLookup = (textToLookup, mustIncludeOriginalText, enableShortWord) => {
      if (!mustIncludeOriginalText) {
        if (!textToLookup || _lastText === textToLookup) {
          return;
        }
        const cacheData = _shortCache.get(textToLookup);
        if (cacheData) {
          updateContent(cacheData.dom, cacheData.hitCount);
          return;
        }
      }

      const lookupWords = text.createLookupWords(textToLookup, settings.lookupWithCapitalized, mustIncludeOriginalText);

      let startTime;
      if (process.env.NODE_ENV !== "production") {
        startTime = new Date().getTime();
      }
      return lookup(lookupWords, enableShortWord).then(({ dom, hitCount }) => {
        _shortCache.put(textToLookup, { dom, hitCount });
        _lastText = textToLookup;

        if (process.env.NODE_ENV !== "production") {
          const time = new Date().getTime() - startTime;
          console.info(`${time}ms:${textToLookup}`);
          console.info(lookupWords);
        }
      });
    };

    const lookup = (lookupWords, enableShortWord) => {
      return _contentGenerator.generate(lookupWords, enableShortWord).then(({ html, hitCount }) => {
        const newDom = dom.create(html);
        updateContent(newDom, hitCount);
        return { dom: newDom, hitCount };
      });
    };
  }
};
