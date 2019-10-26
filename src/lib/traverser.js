/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";

const build = (doConfirmValidCharacter, maxWords) => {
  const traverser = new Traverser(doConfirmValidCharacter, maxWords);

  const getTextUnderCursor = (element, clientX, clientY) => {
    let textOnCursor = null;
    try {
      textOnCursor = traverser.fetchTextUnderCursor(element, clientX, clientY);
    } catch (err) {
      console.error(err);
      textOnCursor = null;
    }
    return textOnCursor;
  };

  return getTextUnderCursor;
};

class Traverser {
  constructor(doIsTargetCharacter, maxWords) {
    this.JA_MAX_LENGTH = 40;
    this.isTargetCharacter = doIsTargetCharacter || isEnglishLikeCharacter;
    this.maxWords = maxWords || 8;
  }

  fetchTextUnderCursor(element, clientX, clientY) {
    const range = getCaretNodeAndOffsetFromPoint(element.ownerDocument, clientX, clientY);
    if (!range) {
      return null;
    }
    const { node, offset } = range;
    if (node.nodeType !== Node.TEXT_NODE) {
      return null;
    }
    return this.fetchTextFromTextNode(node, offset, this.maxWords);
  }

  fetchTextFromTextNode(textNode, offset) {
    const { text, end, isEnglish } = this.getTextFromRange(textNode.data, offset, this.maxWords);
    if (!end) {
      return text;
    }
    const followingText = dom.traverse(textNode);
    const concatenatedText = concatenateFollowingText(text, followingText, isEnglish);
    const endIndex = isEnglish
      ? searchEndIndex(concatenatedText, 0, this.maxWords, this.isTargetCharacter)
      : this.JA_MAX_LENGTH;
    return concatenatedText.substring(0, endIndex);
  }

  getTextFromRange(sourceText, offset) {
    if (!sourceText) {
      return {};
    }
    const code = sourceText.charCodeAt(offset);
    const isEnglish = isEnglishLikeCharacter(code);

    let startIndex, endIndex;
    if (isEnglish) {
      startIndex = searchStartIndex(sourceText, offset, this.isTargetCharacter);
      endIndex = searchEndIndex(sourceText, offset, this.maxWords, this.isTargetCharacter);
    } else {
      startIndex = offset;
      endIndex = offset + this.JA_MAX_LENGTH;
    }
    const text = sourceText.substring(startIndex, endIndex);
    const end = endIndex >= sourceText.length;
    return { text, end, isEnglish };
  }
}

const searchStartIndex = (text, index, doIsTargetCharacter) => {
  let startIndex;
  let i = index;
  for (;;) {
    const code = text.charCodeAt(i);
    if (!doIsTargetCharacter(code)) {
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

const searchEndIndex = (text, index, maxWords, doIsTargetCharacter) => {
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
      if (!doIsTargetCharacter(code)) {
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

const isEnglishLikeCharacter = code => 0x20 <= code && code <= 0x7e;

export default { build };
