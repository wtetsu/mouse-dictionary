/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

const pronounce = (text) => {
  if (!text) {
    return;
  }
  const ssu = new SpeechSynthesisUtterance(text);
  if (isEnglishLikeCharacter(text.charCodeAt(0))) {
    ssu.lang = "en-US";
  } else {
    ssu.lang = "ja-JP";
  }
  speechSynthesis.speak(ssu);
};

// Temporary;
const isEnglishLikeCharacter = (code) => 0x20 <= code && code <= 0x7e;

export default { pronounce };
