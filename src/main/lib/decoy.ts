/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "./dom";

const create = (tag: string | null | undefined) => {
  return new Decoy(tag);
};

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "OPTION"]);

const DEFAULT_STYLES = {
  position: "absolute",
  zIndex: 2147483647,
  opacity: 0,
};

const INPUT_STYLES: Record<string, Record<string, string>> = {
  INPUT: { overflow: "hidden", whiteSpace: "nowrap" },
  TEXTAREA: { overflow: "hidden" },
  SELECT: { overflow: "hidden", whiteSpace: "nowrap" },
  OPTION: { overflow: "hidden", whiteSpace: "nowrap" },
};

const COPY_STYLE_PROPERTIES: (keyof CSSStyleDeclaration & string)[] = [
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
];

type InputLikeElement = HTMLElement & { text?: string; value?: string };

class Decoy {
  elementCache: HTMLElement | null;
  decoy: HTMLElement | null;

  constructor(tag: string | null | undefined) {
    this.elementCache = createElement(tag);
    this.decoy = null;
  }

  activate(underlay: HTMLElement): void {
    if (!this.elementCache) {
      return;
    }
    if (!INPUT_TAGS.has(underlay.tagName)) {
      return;
    }
    const decoy = prepare(dom.clone(underlay, this.elementCache), underlay);

    document.body.appendChild(decoy);
    this.decoy = decoy;

    // These values are required to be set after appendChild.
    decoy.scrollTop = underlay.scrollTop;
    decoy.scrollLeft = underlay.scrollLeft;
    const correctionWidth = underlay.clientWidth - decoy.clientWidth;
    const correctionHeight = underlay.clientHeight - decoy.clientHeight;

    const computedStyle = getComputedStyle(underlay);
    const decoyAdditionStyles: Record<string, string> = {};
    for (const prop of COPY_STYLE_PROPERTIES) {
      decoyAdditionStyles[prop] = computedStyle[prop] as string;
    }
    decoyAdditionStyles.width = `${underlay.clientWidth + correctionWidth}px`;
    decoyAdditionStyles.height = `${underlay.clientHeight + correctionHeight}px`;

    dom.applyStyles(decoy, decoyAdditionStyles);
  }

  deactivate(): void {
    if (!this.elementCache) {
      return;
    }
    const decoy = this.decoy;
    this.decoy = null;
    decoy?.remove();
  }
}

const createElement = (tag: string | null | undefined): HTMLElement | null => {
  if (!tag) {
    return null;
  }
  return document.createElement(tag);
};

const prepare = (decoy: HTMLElement, underlay: HTMLElement): HTMLElement => {
  decoy.innerText = getElementText(underlay);

  const style = createDecoyStyle(decoy, underlay);

  // Specify only absolute size
  style.width = `${underlay.clientWidth}px`;
  style.height = `${underlay.clientHeight}px`;
  dom.applyStyles(decoy, style);
  for (const p of ["min-width", "min-height", "max-width", "max-height"]) {
    decoy.style.removeProperty(p);
  }
  return decoy;
};

const getElementText = (element: InputLikeElement): string => {
  if (element.tagName === "SELECT") {
    return getSelectText(element as HTMLSelectElement);
  }
  return (element.text ?? element.value) as string;
};

function getSelectText(element: HTMLSelectElement): string {
  const index = element.selectedIndex;
  return element.options[index]?.text as string;
}

const createDecoyStyle = (decoy: HTMLElement, underlay: HTMLElement): Record<string, string | number> => {
  const offset = getOffset(underlay);
  const top = offset.top - dom.pxToFloat(decoy.style.marginTop);
  const left = offset.left - dom.pxToFloat(decoy.style.marginLeft);

  const dynamicStyles = {
    top: `${top}px`,
    left: `${left}px`,
  };

  return {
    ...dynamicStyles,
    ...DEFAULT_STYLES,
    ...INPUT_STYLES[underlay.tagName],
  };
};

const getOffset = (element: HTMLElement): { top: number; left: number } => {
  const rect = element.getBoundingClientRect();
  const doc = document.documentElement;

  return {
    top: rect.top + window.scrollY - doc.clientTop,
    left: rect.left + window.scrollX - doc.clientLeft,
  };
};

export default { create };
