/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import consts from "./consts";
import dom from "./dom";

const JA_MAX_LENGTH = 40;

export default (element, clientX, clientY, maxWords = 5) => {
  let textOnCursor = null;
  try {
    textOnCursor = fetchTextOnCursor(element, clientX, clientY, maxWords);
  } catch (err) {
    console.error(err);
    textOnCursor = null;
  }
  return removeQuotes(textOnCursor);
};

const fetchTextOnCursor = (element, clientX, clientY, maxWords) => {
  const range = getCaretNodeAndOffsetFromPoint(element.ownerDocument, clientX, clientY);
  if (!range) {
    return null;
  }
  const { node, offset } = range;
  if (node.nodeType !== Node.TEXT_NODE) {
    return null;
  }
  return fetchTextFromTextNode(node, offset, maxWords);
};

const fetchTextFromTextNode = (textNode, offset, maxWords) => {
  let textOnCursor;
  const { text, end, isEnglish } = getTextFromRange(textNode.data, offset, maxWords);
  if (end) {
    const followingText = dom.traverse(textNode);
    const concatenatedText = concatenateFollowingText(text, followingText, isEnglish);
    const endIndex = isEnglish ? searchEndIndex(concatenatedText, 0, maxWords) : JA_MAX_LENGTH;
    textOnCursor = concatenatedText.substring(0, endIndex);
  } else {
    textOnCursor = text;
  }
  return textOnCursor;
};

const concatenateFollowingText = (text, followingText, isEnglish) => {
  if (!followingText) {
    return text;
  }
  let concatenatedText;
  if (isEnglish) {
    if (followingText.startsWith("-")) {
      concatenatedText = text + followingText;
    } else {
      concatenatedText = text + " " + followingText;
    }
  } else {
    concatenatedText = text + followingText;
  }
  return concatenatedText;
};

const removeQuotes = text => {
  if (!text) {
    return text;
  }
  let start = 0;
  for (;;) {
    if (start >= text.length) {
      break;
    }
    const ch = text.charCodeAt(start);
    if (!consts.quoteCharacters[ch]) {
      break;
    }
    start += 1;
  }

  let end = text.length - 1;
  for (;;) {
    if (end <= 0) {
      break;
    }
    const ch = text.charCodeAt(end);
    if (!consts.quoteCharacters[ch]) {
      break;
    }
    end -= 1;
  }
  return text.substring(start, end + 1);
};

const searchStartIndex = (text, index) => {
  let startIndex;
  let i = index;
  for (;;) {
    const code = text.charCodeAt(i);
    if (!consts.targetCharacters[code]) {
      startIndex = i + 1;
      break;
    }
    if (i <= 0) {
      startIndex = 0;
      break;
    }
    i -= 1;
  }
  return startIndex;
};

const searchEndIndex = (text, index, maxWords) => {
  let endIndex;
  let i = index + 1;
  let spaceCount = 0;
  let theLastIsSpace = false;
  for (;;) {
    const code = text.charCodeAt(i);
    if (code === 0x20) {
      if (!theLastIsSpace) {
        spaceCount += 1;
      }
      theLastIsSpace = true;
      if (spaceCount >= maxWords) {
        endIndex = i;
        break;
      }
    } else {
      if (!consts.targetCharacters[code]) {
        endIndex = i;
        break;
      }
      theLastIsSpace = false;
    }
    if (i >= text.length) {
      endIndex = i;
      break;
    }

    i += 1;
  }
  return endIndex;
};

const getTextFromRange = (text, offset, maxWords) => {
  if (!text) {
    return {};
  }
  const code = text.charCodeAt(offset);
  const isEnglishLikeCharacter = 0x20 <= code && code <= 0x7e;

  let startIndex, endIndex;
  if (isEnglishLikeCharacter) {
    startIndex = searchStartIndex(text, offset);
    endIndex = searchEndIndex(text, offset, maxWords);
  } else {
    startIndex = offset;
    endIndex = offset + JA_MAX_LENGTH;
  }
  const resultText = text.substring(startIndex, endIndex);
  const result = { text: resultText, end: endIndex >= text.length, isEnglish: isEnglishLikeCharacter };
  return result;
};

let getCaretNodeAndOffsetFromPoint = (ownerDocument, pointX, pointY) => {
  // Only the first execution
  getCaretNodeAndOffsetFromPoint = createGetCaretNodeAndOffsetFromPointFunction(ownerDocument);
  return getCaretNodeAndOffsetFromPoint(ownerDocument, pointX, pointY);
};

const createGetCaretNodeAndOffsetFromPointFunction = ownerDocument => {
  let newFunction;
  if (ownerDocument.caretPositionFromPoint) {
    // for Firefox (based on recent WD of CSSOM View Module)
    newFunction = (ownerDocument, pointX, pointY) => {
      let result = null;
      const position = ownerDocument.caretPositionFromPoint(pointX, pointY);
      if (position) {
        let node = position.offsetNode;
        let offset = position.offset;
        result = { node, offset };
      }
      return result;
    };
  } else if (ownerDocument.caretRangeFromPoint) {
    // for Chrome
    newFunction = (ownerDocument, pointX, pointY) => {
      let result = null;
      const range = ownerDocument.caretRangeFromPoint(pointX, pointY);
      if (range) {
        let node = range.startContainer;
        let offset = range.startOffset;
        result = { node, offset };
      }
      return result;
    };
  }
  return newFunction;
};
