/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import entry from "./entry";
import Generator from "./generator";
import dom from "../lib/dom";
import storage from "../lib/storage";
import ShortCache from "../lib/shortcache";
import utils from "../lib/utils";

const TEXT_LENGTH_LIMIT = 128;

export default class Lookuper {
  constructor(settings, doUpdateContent) {
    this.lookupWithCapitalized = settings.lookupWithCapitalized;
    this.doUpdateContent = doUpdateContent;

    this.lastText = null;
    this.aimed = false;
    this.suspended = false;
    this.halfLocked = false;
    this.textLengthLimit = TEXT_LENGTH_LIMIT;

    // Compile templates, regular expressions so that it works fast
    this.generator = new Generator(settings);
    const cacheSize = process.env.NODE_ENV === "production" ? 100 : 0;
    this.shortCache = new ShortCache(cacheSize);

    // String.prototype.matchAll may not exist(#44)
    if (String.prototype.matchAll) {
      this.reForReferences = /[→＝]([- A-z']+)/g;
    }
  }

  canUpdate() {
    if (this.suspended) {
      return false;
    }
    if (this.halfLocked && this.aimed) {
      return false;
    }
    if (!this.halfLocked && utils.getSelection()) {
      return false;
    }
    return true;
  }

  async lookup(text) {
    if (!this.canUpdate()) {
      return;
    }
    await this.update(text, this.lookupWithCapitalized, false, true, 0);
  }

  async aimedLookup(text) {
    if (!text) {
      this.aimed = false;
      return;
    }
    this.aimed = true;
    await this.update(text, true, true, false, 1);
  }

  async update(text, withCapitalized, includeOriginalText, enableShortWord, threshold = 0) {
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
    console.time("lookup");
    const { html, hitCount } = await this.run(textToLookup, withCapitalized, includeOriginalText, enableShortWord);
    if (hitCount >= threshold) {
      const newDom = dom.create(html);
      this.doUpdateContent(newDom, hitCount);
      this.shortCache.put(textToLookup, { dom: newDom, hitCount });
      this.lastText = textToLookup;
    }
    console.timeEnd("lookup");
  }

  async run(textToLookup, withCapitalized, includeOrgText, enableShortWord) {
    const { entries, lang } = entry.build(textToLookup, withCapitalized, includeOrgText);
    console.info(`${entries.join(",")}`);
    console.info(`${entries.length}`);
    const { heads, descriptions } = await fetchDescriptions(entries, this.reForReferences);
    const { html, hitCount } = this.generator.generate(heads, descriptions, enableShortWord && lang === "en");
    return { html, hitCount };
  }
}

const fetchDescriptions = async (entries, reForReferences) => {
  const primaryDescriptions = await storage.local.get(entries);
  const primaryHeads = entries.filter((e) => primaryDescriptions[e]);

  const refHeads = pickOutRefs(primaryDescriptions, reForReferences);
  if (refHeads.length === 0) {
    return { heads: primaryHeads, descriptions: primaryDescriptions };
  }

  console.time("lookup2");
  const refDescriptions = await storage.local.get(refHeads);
  console.timeEnd("lookup2");

  const heads = [...primaryHeads, ...refHeads];
  const descriptions = { ...primaryDescriptions, ...refDescriptions };
  return { heads, descriptions };
};

const pickOutRefs = (descriptions, reForReferences) => {
  const resultSet = new Set();
  if (!reForReferences) {
    return resultSet;
  }
  const existingKeys = new Set(Object.keys(descriptions));
  const descList = Object.values(descriptions);

  for (let i = 0; i < descList.length; i++) {
    const desc = descList[i];
    const refList = capture(desc, reForReferences);

    for (let i = 0; i < refList.length; i++) {
      const ref = refList[i];
      if (existingKeys.has(ref)) {
        continue;
      }
      resultSet.add(ref);
    }
  }
  return Array.from(resultSet);
};

const capture = (str, re) => {
  const capturedStrings = [];
  const matches = str.matchAll(re);
  for (const m of matches) {
    capturedStrings.push(m[1]);
  }
  return capturedStrings;
};
