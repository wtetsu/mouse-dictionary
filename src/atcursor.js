export default (element, clientX, clientY) => {
  let textOnCursor = null;

  try {
    const range = element.ownerDocument.caretRangeFromPoint(clientX, clientY);
    if (range) {
      const container = range.startContainer;
      const startOffset = range.startOffset;

      if (container.nodeType == Node.TEXT_NODE) {
        textOnCursor = getTextFromRange(container.data, startOffset);
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
