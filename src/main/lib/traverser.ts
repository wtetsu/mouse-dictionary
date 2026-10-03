/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import decoy from "./decoy";
import dom from "./dom";
import ponyfill from "./ponyfill/ponyfill";
import utils from "./utils";

// Returns a bit set (1: can continue backward, 2: can continue forward), or undefined for non-English characters
export type CharacterTypeGetter = (code: number) => number | undefined;

type TextFromRange = { text?: string; subText?: string; end?: boolean; isEnglish?: boolean };

const build = (doConfirmValidCharacter?: CharacterTypeGetter, maxWords?: number) => {
  const traverser = new Traverser(doConfirmValidCharacter, maxWords);

  const getTextUnderCursor = (element: HTMLElement, clientX: number, clientY: number): string[] => {
    let textOnCursor: string[] | undefined;
    try {
      textOnCursor = traverser.fetchTextUnderCursor(element, clientX, clientY);
    } catch (err) {
      console.error(err);
    }
    return textOnCursor ?? [];
  };

  return getTextUnderCursor;
};

class Traverser {
  readonly JA_MAX_LENGTH = 40;
  getTargetCharacterType: CharacterTypeGetter;
  maxWords: number;
  decoy: ReturnType<typeof decoy.create>;
  segmenter: Intl.Segmenter | null;

  constructor(doGetTargetCharacterType: CharacterTypeGetter | undefined, maxWords: number | undefined) {
    this.getTargetCharacterType = doGetTargetCharacterType ?? ((code) => (utils.isEnglishLikeCharacter(code) ? 3 : 0));
    this.maxWords = maxWords ?? 8;
    this.decoy = decoy.create("div");
    this.segmenter = createWordSegmenter("ja-JP");
  }

  fetchTextUnderCursor(element: HTMLElement, clientX: number, clientY: number): string[] | undefined {
    const range = ponyfill.getCaretNodeAndOffsetFromPoint(element.ownerDocument, clientX, clientY);
    if (!range) {
      return [];
    }
    const { node, offset } = range;

    if (node.nodeType === Node.TEXT_NODE) {
      return this.fetchTextFromTextNode(node as Text, offset);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.fetchTextFromElementNode(element, clientX, clientY);
    }

    return [];
  }

  fetchTextFromTextNode(textNode: Text, offset: number): string[] {
    const { text, subText, end, isEnglish } = this.getTextFromRange(textNode.data, offset);
    const textList = (subText ? [text, subText] : [text]) as string[];
    if (!end) {
      return textList;
    }
    const followingText = dom.traverse(textNode);
    return textList.map((t) => this.concatenate(t, followingText, isEnglish));
  }

  concatenate(text: string, followingText: string, isEnglish: boolean | undefined): string {
    const concatenatedText = concatenateFollowingText(text, followingText, isEnglish);
    const endIndex = isEnglish
      ? searchEndIndex(concatenatedText, 0, this.maxWords, this.getTargetCharacterType)
      : this.JA_MAX_LENGTH;
    return concatenatedText.substring(0, endIndex);
  }

  fetchTextFromElementNode(element: HTMLElement, clientX: number, clientY: number): string[] | undefined {
    try {
      this.decoy.activate(element);

      const range = ponyfill.getCaretNodeAndOffsetFromPoint(element.ownerDocument, clientX, clientY);
      if (!range) {
        return;
      }
      const { node, offset } = range;

      if (node.nodeType === Node.TEXT_NODE) {
        return this.fetchTextFromTextNode(node as Text, offset);
      }
    } finally {
      this.decoy.deactivate();
    }
  }

  getTextFromRange(sourceText: string, offset: number): TextFromRange {
    if (!sourceText) {
      return {};
    }
    const code = sourceText.charCodeAt(offset);
    const isEnglish = this.getTargetCharacterType(code) !== undefined;

    if (isEnglish) {
      const startIndex = searchStartIndex(sourceText, offset, this.getTargetCharacterType);
      const endIndex = searchEndIndex(sourceText, offset, this.maxWords, this.getTargetCharacterType);
      const text = sourceText.substring(startIndex, endIndex);
      const end = endIndex >= sourceText.length;
      return { text, subText: undefined, end, isEnglish };
    }

    const startIndex = offset;
    const endIndex = offset + this.JA_MAX_LENGTH;
    const properStartIndex = retrieveProperStartIndex(sourceText, startIndex + 1, this.segmenter);
    const text = sourceText.substring(properStartIndex, endIndex);

    const subText = startIndex !== properStartIndex ? sourceText.substring(startIndex, endIndex) : undefined;
    const end = endIndex >= sourceText.length;
    return { text, subText, end, isEnglish };
  }
}

// Returns the start index of the word that contains the character just before cursorIndex
const retrieveProperStartIndex = (
  sourceText: string,
  cursorIndex: number,
  segmenter: Intl.Segmenter | null,
): number => {
  if (!segmenter) {
    return cursorIndex;
  }
  return segmenter.segment(sourceText).containing(cursorIndex - 1)?.index ?? 0;
};

const searchStartIndex = (text: string, index: number, doGetCharacterType: CharacterTypeGetter): number => {
  let startIndex: number;
  let i = index;
  for (;;) {
    const code = text.charCodeAt(i);
    const toPursue = (doGetCharacterType(code) ?? 0) & 1;
    if (!toPursue) {
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

const searchEndIndex = (
  text: string,
  index: number,
  maxWords: number,
  doGetCharacterType: CharacterTypeGetter,
): number => {
  let endIndex: number;
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
      const toPursue = (doGetCharacterType(code) ?? 0) & 2;
      if (!toPursue) {
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

const concatenateFollowingText = (text: string, followingText: string, isEnglish: boolean | undefined): string => {
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

const createWordSegmenter = (lang: string): Intl.Segmenter | null => {
  if (!Intl.Segmenter) {
    return null;
  }
  return new Intl.Segmenter(lang, { granularity: "word" });
};

export default { build };
