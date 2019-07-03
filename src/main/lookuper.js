/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import storage from "../lib/storage";
import ShortCache from "../lib/shortcache";
import generateEntries from "../lib/entry/generate";
import utils from "../lib/utils";
import Generator from "./generator";

const TEXT_LENGTH_LIMIT = 128;

export default class Lookuper {
  constructor(settings, doUpdateContent) {
    this.lookupWithCapitalized = settings.lookupWithCapitalized;
    this.doUpdateContent = doUpdateContent;

    this.lastText = null;
    this.suspended = false;
    this.halfLocked = false;
    this.textLengthLimit = TEXT_LENGTH_LIMIT;

    // Compile templates, regular expressions so that it works fast
    this.generator = new Generator(settings);
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
    if (!this.halfLocked && utils.getSelection()) {
      return false;
    }
    return true;
  }

  async lookup(text) {
    await this.update(text, false, true, 0);
  }

  async aimedLookup(text) {
    this.selectedText = text;
    if (!this.selectedText) {
      return;
    }
    await this.update(text, true, false, 1);
  }

  async update(text, includeOriginalText, enableShortWord, threshold) {
    if (!text) {
      return;
    }
    const textToLookup = text.substring(0, this.textLengthLimit);
    if (!textToLookup) {
      return;
    }
    if (!includeOriginalText) {
      if (this.lastText === textToLookup) {
        return;
      }
      const cacheData = this.shortCache.get(textToLookup);
      if (cacheData) {
        this.doUpdateContent(cacheData.dom, cacheData.hitCount);
        this.lastText = textToLookup;
        return;
      }
    }
    await this.run(textToLookup, includeOriginalText, enableShortWord, threshold);
  }

  async run(textToLookup, includeOrgText, enableShortWord, threshold) {
    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }

    const { entries, lang } = generateEntries(textToLookup, this.lookupWithCapitalized, includeOrgText);
    const descriptions = await storage.local.get(entries);
    const { html, hitCount } = this.generator.generate(entries, descriptions, enableShortWord && lang === "en");
    const newDom = dom.create(html);

    if (hitCount < threshold) {
      return;
    }
    this.doUpdateContent(newDom, hitCount);

    this.shortCache.put(textToLookup, { dom: newDom, hitCount });
    this.lastText = textToLookup;

    if (process.env.NODE_ENV !== "production") {
      const time = new Date().getTime() - startTime;
      console.info(`${time}ms:${textToLookup}`);
      console.info(entries);
    }
  }
}
