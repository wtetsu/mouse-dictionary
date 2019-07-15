/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

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
    if (resultWords.length >= maxTraverseWords) {
      break;
    }
    if (!current || current.tagName === "BODY") {
      break;
    }
    const words = getDescendantsWords(current, startingPoint, false);
    resultWords.push(...words);
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

  //const children = getChildren(elem, startingPoint, includeStartingPoint);
  const children = getChildren(elem, startingPoint, includeStartingPoint);

  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i], null, false);
    words.push(...descendantsWords);
  }
  return words;
};

const getChildren = (elem, startingPoint, includeStartingPoint) => {
  let resultChildren;
  if (startingPoint) {
    const { children, areAllTextNodes } = selectTargetChildren(elem, startingPoint, includeStartingPoint);
    resultChildren = areAllTextNodes ? processSiblings(children) : children;
  } else {
    const children = Array.from(elem.childNodes);
    const areAllTextNodes = children.every(isVirtualTextNode);
    resultChildren = areAllTextNodes ? processSiblings(children) : children;
  }
  return resultChildren;
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

const TEXT_TAGS = ["SPAN"];

const isVirtualTextNode = element => {
  const len = element.children && element.children.length;
  return len === 0 && TEXT_TAGS.includes(element.tagName);
};

export default { runFrom, runAfter };
