/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ponyfill from "./ponyfill/ponyfill";

export type Styles = Record<string, string | number>;

// Callers pass HTML that has a single root element
const create = <T extends Element = HTMLElement>(html: string): T => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild as T;
};

// Accepts any style object such as Styles or React.CSSProperties
const applyStyles = (element: HTMLElement, styles: object | null | undefined): void => {
  if (!styles || typeof styles !== "object") {
    return;
  }
  try {
    const style = element.style as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(styles)) {
      style[key] = value;
    }
  } catch (e) {
    console.error(e);
  }
};

const replace = (element: Element, newDom: Node | null | undefined): void => {
  if (newDom) {
    element.replaceChildren(newDom);
  } else {
    element.replaceChildren();
  }
};

const MAX_TRAVERSE_LEVEL = 4;
const MAX_TRAVERSE_WORDS = 10;

const traverse = (elem: Node): string => {
  const resultWords: string[] = [];

  let current: Node | null = elem;
  let skip: Node = current;

  for (let i = 0; i < MAX_TRAVERSE_LEVEL; i++) {
    if (!current || (current as Element).tagName === "BODY") {
      break;
    }

    const words = getDescendantsWords(current, skip);
    resultWords.push(...words);

    if (resultWords.length >= MAX_TRAVERSE_WORDS) {
      break;
    }

    skip = current;
    current = current.parentNode;
  }

  return joinWords(resultWords.slice(0, MAX_TRAVERSE_WORDS));
};

const joinWords = (words: string[]): string => {
  const newWords: string[] = [];
  let i = 0;
  for (;;) {
    if (i >= words.length) {
      break;
    }
    const w = words[i];

    if (w === "-") {
      if (newWords.length === 0) {
        const nextWord = words[i + 1];
        newWords.push("-" + nextWord);
      } else {
        const prevWord = newWords.at(-1);
        const nextWord = words[i + 1];
        newWords[newWords.length - 1] = prevWord + "-" + nextWord;
      }
      i += 2;
    } else {
      newWords.push(w);
      i += 1;
    }
  }
  return newWords.join(" ");
};

const getDescendantsWords = (elem: Node, skip?: Node): string[] => {
  const words: string[] = [];

  if (!elem.childNodes || elem.childNodes.length === 0) {
    if (elem === skip) {
      return [];
    }
    const t = elem.textContent?.trim();
    return t ? [t] : [];
  }

  const children = getChildren(elem, skip);
  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i]);
    words.push(...descendantsWords);
  }
  return words;
};

const getChildren = (elem: Node, skip?: Node): ArrayLike<Node> => {
  if (!skip) {
    return elem.childNodes;
  }

  const result: Node[] = [];
  for (let i = elem.childNodes.length - 1; i >= 0; i--) {
    const child = elem.childNodes[i];
    if (child === skip) {
      break;
    }
    result.push(child);
  }
  return result.reverse();
};

const clone = <T extends HTMLElement>(orgElement: HTMLElement, baseElement?: T): T | HTMLElement => {
  const clonedElement = baseElement ?? document.createElement(orgElement.tagName);

  // Copy all styles
  clonedElement.style.cssText = ponyfill.getComputedCssText(orgElement);

  return clonedElement;
};

// "100px" -> 100.0
const pxToFloat = (str: string | null | undefined): number => {
  if (!str) {
    return 0;
  }
  if (str.endsWith("px")) {
    return Number.parseFloat(str.slice(0, -2));
  }
  return Number.parseFloat(str);
};

/**
 * VirtualStyle can apply styles to the inner element.
 * This has "shadow" styles internally which can prevent from unnecessary style updates.
 *
 * Repeated element style updates could cause some unnecessary loads,
 * even if the assigned value is not different.
 *
 * element.style.cursor = "move";
 */
class VirtualStyle {
  element: HTMLElement;
  stagedStyles: Map<string, string | number>;
  appliedStyles: Map<string, string | number>;

  constructor(element: HTMLElement) {
    this.element = element;
    this.stagedStyles = new Map();
    this.appliedStyles = new Map();
  }

  set(prop: string, value: string | number): void {
    if (this.stagedStyles.get(prop) === value) {
      return;
    }
    this.stagedStyles.set(prop, value);
    this.updateStyles();
  }

  apply(styles: Styles): void {
    for (const [prop, value] of Object.entries(styles)) {
      this.stagedStyles.set(prop, value);
    }
    this.updateStyles();
  }

  updateStyles(): void {
    const diff = this.getUpdatedData(this.stagedStyles, this.appliedStyles);
    if (!diff) {
      return;
    }

    applyStyles(this.element, diff);
    this.stagedStyles = new Map();
    for (const [prop, value] of Object.entries(diff)) {
      this.appliedStyles.set(prop, value);
    }
  }

  getUpdatedData(
    stagedStyles: Map<string, string | number>,
    appliedStyles: Map<string, string | number>,
  ): Styles | null {
    const diff: Styles = {};
    let count = 0;
    for (const [prop, stagedValue] of stagedStyles) {
      if (stagedValue !== appliedStyles.get(prop)) {
        diff[prop] = stagedValue;
        count += 1;
      }
    }
    if (count === 0) {
      return null;
    }
    return diff;
  }
}

export default {
  create,
  applyStyles,
  replace,
  traverse,
  clone,
  pxToFloat,
  VirtualStyle,
};
