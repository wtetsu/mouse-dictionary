/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ajax from "../lib/ajax";
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
    this.counter = 0;

    this.eitangoEmail = settings.eitangoEmail;
    this.eitangoPassword = settings.eitangoPassword;

    // Compile templates, regular expressions so that it works fast
    this.generator = new Generator(settings);
    const cacheSize = process.env.NODE_ENV === "production" ? 100 : 0;
    this.shortCache = new ShortCache(cacheSize);

    // String.prototype.matchAll may not exist(#44)
    if (String.prototype.matchAll) {
      this.reForReferences = /[→＝]([- A-z']+)/g;
    }
  }

  #canUpdate() {
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
    return this.lookupAll([text]);
  }

  async lookupAll(textList) {
    if (!this.#canUpdate()) {
      return false;
    }
    return await this.#updateAll(textList, this.lookupWithCapitalized, false, true, 0);
  }

  async aimedLookup(text) {
    if (!text) {
      this.aimed = false;
      return false;
    }
    this.aimed = true;
    return await this.update(text, true, true, false, 1);
  }

  async update(text, withCapitalized, includeOriginalText, enableShortWord, threshold = 0) {
    if (!text) {
      return false;
    }
    return await this.#updateAll([text], withCapitalized, includeOriginalText, enableShortWord, threshold);
  }

  async #updateAll(textList, withCapitalized, includeOriginalText, enableShortWord, threshold = 0) {
    const { content, hit } = await this.#createContent(textList, withCapitalized, includeOriginalText, enableShortWord);

    if (hit >= threshold) {
      this.doUpdateContent(content, hit);

      // 単語登録イベントの追加
      const eitango_buttons = document.querySelectorAll('.eitango_word_register');

      eitango_buttons.forEach((button) => {
        // 値を設定
        const word = button.querySelector('.word').defaultValue;
        const definition = button.querySelector('.definition').defaultValue;
        const email = this.eitangoEmail;
        const password = this.eitangoPassword;

        // イベントを設定
        button.onclick = () => {
          console.log("クリック");

          // チェック
          if (word == "") {
            alert("単語がありません。");

          } else if (email == "" | password == "") {
            const str = "単語を登録するには、メールアドレス等の入力が必要です。拡張機能のオプション画面から連携設定を行ってください。";

            const error_message_box = document.getElementById('eitango_error_message_box');
            const message = document.getElementById('eitango_error_message');

            message.innerHTML = str;
            error_message_box.style.display = "flex";
            setTimeout(() => {
              error_message_box.style.display = "none";
            }, 2000);

          } else { // 実行
            eitangoAjax(word, definition, email, password);
          }
        };
      });

      const eitango_picker = document.getElementById('eitango_picker');
      eitango_picker.onclick = () => {
        this.suspended = true;
      };

      return true;
    }
    return false;
  }

  async #createContent(sourceTextList, withCapitalized, includeOriginalText, enableShortWord) {
    const textList = [];
    for (let i = 0; i < sourceTextList.length; i++) {
      const text = sourceTextList[i].substring(0, this.textLengthLimit);
      if (text) {
        textList.push(text);
      }
    }
    const cacheKey = textList.join("\u0001");

    if (!includeOriginalText) {
      if (this.lastText === cacheKey) {
        return {};
      }
      const cacheData = this.shortCache.get(cacheKey);
      if (cacheData) {
        this.doUpdateContent(cacheData.dom, cacheData.hitCount);
        this.lastText = cacheKey;
        return {};
      }
    }
    const counter = ++this.counter;
    console.time(`lookup-${counter}`);
    const { html, hit } = await this.runAll(textList, withCapitalized, includeOriginalText, enableShortWord);
    const content = dom.create(html);

    this.lastText = cacheKey;
    console.timeEnd(`lookup-${counter}`);

    return { content, hit };
  }

  async run(textToLookup, withCapitalized, includeOrgText, enableShortWord) {
    return this.runAll([textToLookup], withCapitalized, includeOrgText, enableShortWord);
  }

  async runAll(textList, withCapitalized, includeOrgText, enableShortWord) {
    const allEntries = [];
    const langs = [];
    for (let i = 0; i < textList.length; i++) {
      const text = textList[i];
      const { entries, lang } = entry.build(text, withCapitalized, includeOrgText);
      console.info(`${entries.join(",")}`);
      console.info(`${entries.length}`);

      allEntries.push(...entries);
      langs.push(lang);
    }
    const { heads, descriptions } = await fetchDescriptions(allEntries, this.reForReferences);
    const { html, hitCount } = this.generator.generate(heads, descriptions, enableShortWord && langs[0] === "en");
    return { html, hit: hitCount };
  }
}

const fetchDescriptions = async (entries, reForReferences) => {
  const primaryDescriptions = await storage.local.get(entries);
  const primaryHeads = entries.filter((e) => primaryDescriptions[e]);

  const refHeads = pickOutRefs(primaryDescriptions, reForReferences);
  if (refHeads.length === 0) {
    return { heads: primaryHeads, descriptions: primaryDescriptions };
  }

  const refDescriptions = await storage.local.get(refHeads);
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

// つながる連携用の Ajax
const eitangoAjax = (word, definition, email, password) => {
  // ロードの表示
  const loading = document.getElementById('eitango_api_load');
  loading.style.display = "flex";
  const loading_message = document.getElementById('eitango_load_message');
  loading_message.innerHTML = '<img src="https://urbanmeetup.tokyo/img/loading_white.svg" style="width: 40px;">';

  const data = {
    word: word,
    definition: definition,
    from: "eitango_picker",
    email: email,
    password: password,
  }
  ajax.post("https://school.urbanmeetup.tokyo/api/dic/register/favorite", data);
};
