import consts from "./consts";

export default (element, clientX, clientY) => {
  let textOnCursor = null;

  try {
    const range = getCaretNodeAndOffsetFromPoint(element.ownerDocument, clientX, clientY);
    if (range) {
      const { node, offset } = range;
      if (node.nodeType === Node.TEXT_NODE) {
        textOnCursor = getTextFromRange(node.data, offset);
      }
    }
  } catch (err) {
    textOnCursor = null;
  }
  console.info(textOnCursor);
  return textOnCursor;
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

const searchEndIndex = (text, index) => {
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
      if (spaceCount >= 4) {
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

const getTextFromRange = (text, offset) => {
  if (!text) {
    return null;
  }
  const code = text.charCodeAt(offset);
  const isEnglishLikeCharacter = 0x20 <= code && code <= 0x7e;
  if (!isEnglishLikeCharacter) {
    return null;
  }

  const startIndex = searchStartIndex(text, offset);
  const endIndex = searchEndIndex(text, offset);

  return text.substring(startIndex, endIndex);
};

const getCaretNodeAndOffsetFromPoint = (ownerDocument, pointX, pointY) => {
  let node = null;
  let offset = null;
  let result = null;

  if (ownerDocument.caretPositionFromPoint) {
    // for Firefox (based on recent WD of CSSOM View Module)
    const position = ownerDocument.caretPositionFromPoint(pointX, pointY);
    if (position) {
      node = position.offsetNode;
      offset = position.offset;
      result = { node, offset };
    }
  } else if (ownerDocument.caretRangeFromPoint) {
    // for Chrome
    const range = ownerDocument.caretRangeFromPoint(pointX, pointY);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
      result = { node, offset };
    }
  }

  return result;
};
