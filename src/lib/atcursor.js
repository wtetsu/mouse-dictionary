/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import consts from "./consts";
import traverse from "./traverse";

const JA_MAX_LENGTH = 40;

export default (element, clientX, clientY, maxWords = 5) => {
  let text;
  try {
    const slidStartingPoint = slideStartingPoint(element);
    if (slidStartingPoint) {
      const rawText = traverse.runFrom(slidStartingPoint, maxWords);
      text = getTextFromRange(rawText, 0, maxWords).text;
    } else {
      text = fetchTextFromPoint(element, clientX, clientY, maxWords);
    }
  } catch (err) {
    console.error(err);
    text = null;
  }
  return text;
};

const slideStartingPoint = elem => {
  let slidStartingPoint = null;

  const siblings = elem.parentNode && elem.parentNode.childNodes;
  let selfIndex = null;
  for (let i = siblings.length - 1; i >= 0; i--) {
    const child = siblings[i];
    if (selfIndex === null) {
      if (child === elem) {
        selfIndex = i;
        if (selfIndex === 0 && siblings.length >= 2) {
          if (isValidTextNodes(siblings[0], siblings[1])) {
            slidStartingPoint = elem;
          }
        }
      }
    } else {
      if (!isValidTextNode(child)) {
        if (selfIndex !== i + 1) {
          slidStartingPoint = siblings[i + 1];
        } else if (isValidTextNodes(siblings[selfIndex], siblings[selfIndex + 1])) {
          slidStartingPoint = elem;
        }
        break;
      } else {
        if (i === 0) {
          slidStartingPoint = elem;
        }
      }
    }
  }
  return slidStartingPoint;
};

const TEXT_TAGS = ["SPAN"];

const isValidTextNodes = (...elements) => {
  return elements.every(isValidTextNode);
};
const isValidTextNode = element => {
  if (!element) {
    false;
  }
  if (!TEXT_TAGS.includes(element.tagName)) {
    return false;
  }
  const childrenNumber = (element.children && element.children.length) || 0;
  if (childrenNumber >= 1) {
    return false;
  }
  if (element.textContent.includes(" ")) {
    return false;
  }
  return true;
};

const fetchTextFromPoint = (element, clientX, clientY, maxWords) => {
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
    const followingText = traverse.runAfter(textNode);
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
