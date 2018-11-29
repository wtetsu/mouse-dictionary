/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import consts from "./consts";

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
  const { text, end } = getTextFromRange(textNode.data, offset, maxWords);
  if (!end) {
    if (text) {
      textOnCursor = text;
    }
  } else {
    const siblingsText = fetchSiblingsText(textNode);
    if (siblingsText) {
      const concatenatedText = text + " " + siblingsText;
      const endIndex = searchEndIndex(concatenatedText, 0, maxWords);
      textOnCursor = concatenatedText.substring(0, endIndex);
    } else {
      textOnCursor = text;
    }
  }
  return textOnCursor;
};

const fetchSiblingsText = endNode => {
  const node = endNode.parentNode;
  const children = node.parentElement && node.parentElement.children;
  if (!children || children.length === 0) {
    return "";
  }
  let selfIndex;
  for (selfIndex = 0; selfIndex < children.length; selfIndex++) {
    const child = children[selfIndex];
    if (node === child) {
      break;
    }
  }
  let text = "";
  for (let i = selfIndex + 1; i < children.length; i++) {
    if (text.length >= 30) {
      break;
    }
    const child = children[i];
    const t = child.textContent && child.textContent.trim();
    if (t) {
      text += " " + t;
    }
  }
  return text;
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
  if (!isEnglishLikeCharacter) {
    return {};
  }
  const startIndex = searchStartIndex(text, offset);
  const endIndex = searchEndIndex(text, offset, maxWords);
  const resultText = text.substring(startIndex, endIndex);
  const end = endIndex >= text.length;
  return { text: resultText, end };
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
