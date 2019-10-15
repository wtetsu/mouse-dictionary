/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import letters from "./letters";
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
  return textOnCursor;
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
  const { text, end, isEnglish } = getTextFromRange(textNode.data, offset, maxWords);
  if (!end) {
    return text;
  }
  const followingText = dom.traverse(textNode);
  const concatenatedText = concatenateFollowingText(text, followingText, isEnglish);
  const endIndex = isEnglish ? searchEndIndex(concatenatedText, 0, maxWords) : JA_MAX_LENGTH;
  return concatenatedText.substring(0, endIndex);
};

const concatenateFollowingText = (text, followingText, isEnglish) => {
  if (!followingText) {
    return text;
  }
  if (!isEnglish) {
    return text + followingText;
  }
  if (followingText.startsWith("-")) {
    return text + followingText;
  }
  return text + " " + followingText;
};

const searchStartIndex = (text, index) => {
  let startIndex;
  let i = index;
  for (;;) {
    const code = text.charCodeAt(i);
    if (!letters.has(code)) {
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
      if (!letters.has(code)) {
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
      const position = ownerDocument.caretPositionFromPoint(pointX, pointY);
      if (!position) {
        return null;
      }
      return {
        node: position.offsetNode,
        offset: position.offset
      };
    };
  } else if (ownerDocument.caretRangeFromPoint) {
    // for Chrome
    newFunction = (ownerDocument, pointX, pointY) => {
      const range = ownerDocument.caretRangeFromPoint(pointX, pointY);
      if (!range) {
        return null;
      }
      return {
        node: range.startContainer,
        offset: range.startOffset
      };
    };
  }
  return newFunction;
};
