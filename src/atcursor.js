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
  return textOnCursor;
};

const searchStartIndex = (text, index) => {
  let startIndex;
  let i = index;
  for (;;) {
    if (text[i] === " ") {
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
  for (;;) {
    if (text[i] === " ") {
      spaceCount += 1;
      if (spaceCount >= 4) {
        endIndex = i;
        break;
      }
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
  const ch = text[offset];

  if (!ch || !ch.match(/[\x20-\x7E]/)) {
    return null;
  }

  const startIndex = searchStartIndex(text, offset);
  const endIndex = searchEndIndex(text, offset);

  return text.substring(startIndex, endIndex);
};

const getCaretNodeAndOffsetFromPoint = (ownerDocument, pointX, pointY) => {
  let node = null;
  let offset = null;
  if (ownerDocument.caretPositionFromPoint != null) { // for Firefox (based on recent WD of CSSOM View Module)
    const position = ownerDocument.caretPositionFromPoint(pointX, pointY);
    if (position) {
      node = position.offsetNode;
      offset = position.offset;
    }
  } else if (ownerDocument.caretRangeFromPoint != null) { // for Chrome
    const range = ownerDocument.caretRangeFromPoint(pointX, pointY);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
    }
  } else {
    return null;
  }

  return { node, offset };
};
