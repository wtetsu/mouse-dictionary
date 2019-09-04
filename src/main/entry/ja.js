/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import rule from "../rule";

const createLookupWordsJa = sourceStr => {
  const str = sourceStr.substring(0, 40).replace(/[A-Za-z0-9]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xfee0));

  const result = new UniqList();

  for (let i = str.length; i >= 1; i--) {
    const part = str.substring(0, i);
    result.push(part);

    if (i >= 2) {
      const deinedWords = rule.doJa(part);
      result.merge(deinedWords);
    }
  }
  return result.toArray();
};

export default createLookupWordsJa;
