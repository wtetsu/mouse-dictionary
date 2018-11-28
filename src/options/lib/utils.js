/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default {
  decideInitialLanguage(languages) {
    if (!languages) {
      return "en";
    }
    const validLanguages = ["en", "ja"];
    let result = "en";
    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i].toLowerCase().split("-")[0];
      if (validLanguages.includes(lang)) {
        result = lang;
        break;
      }
    }
    return result;
  },

  tryToParseJson(json) {
    let result;
    try {
      result = JSON.parse(json);
    } catch (e) {
      result = null;
    }
    return result;
  }
};
