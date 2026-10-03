/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type EntryGenerator = (text: string, withCapitalized?: boolean, mustIncludeOriginalText?: boolean) => string[];
export type BuildEntries = (
  text: string,
  withCapitalized: boolean,
  mustIncludeOriginalText: boolean,
) => { entries: string[]; lang: string };

const build = (
  languageDetector: (text: string) => string,
  generators: Record<string, EntryGenerator> & { default: EntryGenerator },
): BuildEntries => {
  return (text, withCapitalized, mustIncludeOriginalText) => {
    const lang = languageDetector(text);
    const generator = generators[lang] ?? generators.default;
    const entries = generator(text, withCapitalized, mustIncludeOriginalText);
    return { entries, lang };
  };
};

export default { build };
