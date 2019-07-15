/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const TEXT_TAGS = ["SPAN"];

const runFrom = (elem, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  return run(elem, true, maxTraverseWords, maxTraverseLevel);
};

const runAfter = (elem, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  return run(elem, false, maxTraverseWords, maxTraverseLevel);
};

const run = (elem, includeStartingPoint, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  const resultWords = [];
  let startingPoint = elem;
  let current = startingPoint.parentNode;
  resultWords.push(...getDescendantsWords(current, startingPoint, includeStartingPoint));
  startingPoint = current;
  current = current.parentNode;

  for (let i = 0; i < maxTraverseLevel; i++) {
    if (!current || current.tagName === "BODY") {
      break;
    }
    const words = getDescendantsWords(current, startingPoint, false);
    resultWords.push(...words);
    if (resultWords.length >= maxTraverseWords) {
      break;
    }
    startingPoint = current;
    current = current.parentNode;
  }
  const text = joinWords(resultWords.slice(0, maxTraverseWords));
  return text;
};

const getDescendantsWords = (elem, startingPoint, includeStartingPoint) => {
  const words = [];

  if (!elem.childNodes || elem.childNodes.length === 0) {
    if (elem === startingPoint) {
      return [];
    }
    const t = elem.textContent.trim();
    return t ? [t] : [];
  }

  const children = getChildren(elem, startingPoint, includeStartingPoint);
  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i], null);
    words.push(...descendantsWords);
  }
  return words;
};

const getChildren = (elem, startingPoint, includeStartingPoint) => {
  if (!startingPoint) {
    return elem.childNodes;
  }
  const { children, areAllTextNodes } = selectTargetChildren(elem, startingPoint, includeStartingPoint);
  return areAllTextNodes ? processSiblings(children) : children;
};

const selectTargetChildren = (elem, startingPoint, includeStartingPoint) => {
  const targetChildren = [];
  let areAllTextNodes = true;
  let foundStartingPoint = false;
  for (let i = elem.childNodes.length - 1; i >= 0; i--) {
    const child = elem.childNodes[i];
    if (areAllTextNodes) {
      if (!isVirtualTextNode(child)) {
        areAllTextNodes = false;
      }
    }
    if (!foundStartingPoint) {
      foundStartingPoint = child === startingPoint;
    }

    if (foundStartingPoint && !includeStartingPoint) {
      break;
    }
    targetChildren.push({
      tagName: child.tagName,
      textContent: child.textContent,
      children: child.children,
      childNodes: child.childNodes
    });

    if (foundStartingPoint && includeStartingPoint) {
      if (!isVirtualTextNode(child) || child.textContent.includes(" ")) {
        break;
      }
    }
  }
  return { children: targetChildren.reverse(), areAllTextNodes };
};

const processSiblings = siblings => {
  const textContent = siblings.map(it => it.textContent).join("");
  return [
    {
      tagName: "",
      textContent: textContent,
      children: [],
      childNodes: []
    }
  ];
};

const isVirtualTextNode = element => {
  if (element.nodeType === 3) {
    return true;
  }
  const len = element.children && element.children.length;
  return len === 0 && TEXT_TAGS.includes(element.tagName);
};

const joinWords = words => {
  let joinNext = false;
  let currentWord = "";
  const newWords = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (joinNext) {
      currentWord += w;
      joinNext = false;
    } else {
      if (w === "-") {
        currentWord += "-";
        joinNext = true;
      } else {
        if (currentWord) {
          newWords.push(currentWord);
        }
        joinNext = false;
        currentWord = w;
      }
    }
  }
  if (currentWord) {
    newWords.push(currentWord);
  }
  return newWords.join(" ");
};

export default { runFrom, runAfter };
