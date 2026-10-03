/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import utils from "./utils";

const pronounce = (text) => {
  if (!text) {
    return;
  }
  const ssu = new SpeechSynthesisUtterance(text);
  if (utils.isEnglishLikeCharacter(text.charCodeAt(0))) {
    ssu.lang = "en-US";
  } else {
    ssu.lang = "ja-JP";
  }
  speechSynthesis.speak(ssu);
};

export default { pronounce };
