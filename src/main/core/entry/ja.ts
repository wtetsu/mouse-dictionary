/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import rule from "../rule";

const RE_ALPHABETS_NUMBERS = /[A-Za-z0-9]/g;
const FULLWIDTH_OFFSET = 0xfee0;

// Halfwidth katakana (U+FF61-FF9F, common in manga/UI text) is converted to
// its fullwidth form so ﾃﾚﾋﾞ looks up the same headwords as テレビ.
// The conversion is applied per character inside the halfwidth-katakana range
// only: NFKC over the whole string would fold unrelated characters too
// (circled digits, fullwidth latin, ligatures...). The trailing NFC pass is a
// canonical-composition pass, needed to combine the converted voiced marks
// with the preceding letter (ｶ + ﾞ -> ガ); it performs no compatibility folds.
const RE_HALFWIDTH_KATAKANA = /[\uFF61-\uFF9F]/;
const RE_HALFWIDTH_KATAKANA_G = /[\uFF61-\uFF9F]/g;

const convertHalfwidthKatakana = (s: string): string =>
  s.replace(RE_HALFWIDTH_KATAKANA_G, (c) => c.normalize("NFKC")).normalize("NFC");

const createLookupWordsJa = (sourceStr: string): string[] => {
  const str = sourceStr
    .substring(0, 40)
    .replaceAll("\u200c", "") // ZERO WIDTH NON-JOINER
    .replace(RE_ALPHABETS_NUMBERS, (s: string) => String.fromCharCode(s.charCodeAt(0) + FULLWIDTH_OFFSET));

  const result = new UniqList<string>();

  result.push(sourceStr); // Add the original word

  // For halfwidth input, keep both chains: every candidate retains its usual
  // prefix decomposition (show-all-plausible-candidates design), e.g.
  // ﾃﾚﾋ -> ﾃﾚﾋ/ﾃﾚ/ﾃ plus テレビ/テレ/テ.
  const chains = [str];
  if (RE_HALFWIDTH_KATAKANA.test(str)) {
    const converted = convertHalfwidthKatakana(str);
    if (converted !== str) {
      chains.push(converted);
    }
  }

  for (const chain of chains) {
    for (let i = chain.length; i >= 1; i--) {
      const part = chain.substring(0, i);
      result.push(part);

      if (i >= 2) {
        const deinedWords = rule.doJa(part);
        result.merge(deinedWords ?? []);
      }
    }
  }
  return result.toArray();
};

export default createLookupWordsJa;
