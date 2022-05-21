/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const build = (languageDetector, generators) => {
  return (text, withCapitalized, mustIncludeOriginalText) => {
    const lang = languageDetector(text);
    const generator = generators[lang] ?? generators.default;
    const entries = generator(text, withCapitalized, mustIncludeOriginalText);
    return { entries, lang };
  };
};

export default { build };
