import string from "./string";
import Draggable from "./draggable";

let area;

const getWordAtPoint = (elem, x, y) => {
  let word = null;
  if (elem.nodeType === elem.TEXT_NODE) {
    word = getWordAtPointForTextNode(elem, x, y);
  } else {
    word = getWordAtPointForOthers(elem, x, y);
  }
  return word;
};

const getWordAtPointForTextNode = (elem, x, y) => {
  console.log("getWordAtPointForTextNode");
  let word = null;
  let range = elem.ownerDocument.createRange();
  range.selectNodeContents(elem);
  let currentPos = 0;
  let endPos = range.endOffset;
  while (currentPos + 1 < endPos) {
    console.log(`currentPos:${currentPos},endPos:${endPos}`);
    range.setStart(elem, currentPos);
    range.setEnd(elem, currentPos + 1);
    let rect = range.getBoundingClientRect();
    console.log(rect);
    if (insideRect(rect, x, y)) {
      range.expand("word");
      expandRange(range, elem, currentPos);
      word = range.toString();
      range.detach();
      break;
    }
    currentPos += 1;
  }
  return word;
};

const insideRect = (rect, x, y) => {
  console.log(
    "rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y;"
  );

  console.log(
    `${rect.left} <= ${x} && ${rect.right} >= ${x} && ${rect.top} <= ${y} && ${
      rect.bottom
    } >= ${y};`
  );
  return rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y;
};

const getWordAtPointForOthers = (elem, x, y) => {
  console.log("getWordAtPointForOthers");
  let word = null;
  for (var i = 0; i < elem.childNodes.length; i++) {
    var range = elem.childNodes[i].ownerDocument.createRange();
    range.selectNodeContents(elem.childNodes[i]);
    let rect = range.getBoundingClientRect();
    if (insideRect(rect, x, y)) {
      range.detach();
      word = getWordAtPoint(elem.childNodes[i], x, y);
      if (word) {
        break;
      }
    } else {
      range.detach();
    }
  }
  return word;
};

const expandRange = (range, elem, startIndex) => {
  for (let i = startIndex + 1; i < startIndex + 100; i++) {
    try {
      range.setEnd(elem, i);
    } catch (ex) {
      break;
    }
  }
};

const createDescriptionHtml = text => {
  return text
    .replace(/\\/g, "\n")
    .replace(/(◆.+)/g, '<font color="#008000">$1</font>')
    .replace(/(【.+?】)/g, '<font color="#000088">$1</font>')
    .replace(/\n/g, "<br/>");
};

const consultAndCreateContentHtml = words => {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(words, meanings => {
      let contentHtml = createContentHtml(words, meanings);
      resolve(contentHtml);
    });
  });
};

const createContentHtml = (words, meanings) => {
  let currentString = "";
  let descriptions = [];
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let desc = meanings[word];
    if (desc) {
      let html =
        '<font color="#000088"><strong>' +
        word +
        "</strong></font><br/>" +
        createDescriptionHtml(desc);
      descriptions.push(html);
    }
  }
  if (descriptions.length === 0) {
    descriptions.push(
      '<font color="#000088"><strong>' + words[0] + "</strong></font><br/>"
    );
  }
  let contentHtml = descriptions.join('<br/><hr width="100%"/>');
  return contentHtml;
};

let _lastText = null;

const reNewLine = /(\r\n|\n|\r|\,|\.)/gm;

document.body.addEventListener("mousemove", ev => {
  console.log(`${ev.x},${ev.y}`);
  let text = getWordAtPoint(ev.target, ev.x, ev.y);
  if (!text) {
    return;
  }
  if (_lastText == text) {
    return;
  }
  console.warn(text);
  let arr = text
    .trim()
    .replace(reNewLine, " ")
    .split(" ");
  let linkedWords = string.linkWords(arr);
  let w = string.parseString(arr[0]);
  linkedWords.splice.apply(linkedWords, [0, 0].concat(w));
  consultAndCreateContentHtml(linkedWords).then(contentHtml => {
    area.content.innerHTML = contentHtml;
    _lastText = text;
  });
});

const createDialogElement = () => {
  let dialog = document.createElement("div");
  dialog.style.width = "200px";
  dialog.style.height = "200px";
  dialog.style.position = "fixed";
  dialog.style.resize = "both";
  dialog.style.overflow = "hidden";
  dialog.style.top = 0;
  dialog.style.left = 0;
  dialog.style.backgroundColor = "#ffffff";
  dialog.style.zIndex = 2147483647;
  dialog.style.fontSize = "0.8em";
  dialog.style.border = "1px solid #A0A0A0";
  dialog.style.textAlign = "left";
  dialog.style.lineHeight = "normal";
  return dialog;
};

const createHeaderElement = () => {
  let header = document.createElement("div");
  header.innerText = "Mouse Dictionary";
  header.style.cursor = "pointer";
  header.style.backgroundColor = "#EBEBEB";
  return header;
};

const createContentElement = () => {
  let content = document.createElement("div");
  return content;
};

const createArea = () => {
  let dialog = createDialogElement();
  let header = createHeaderElement();
  let content = createContentElement();
  dialog.appendChild(header);
  dialog.appendChild(content);
  return { dialog, header, content };
};

area = createArea();
document.body.appendChild(area.dialog);

const draggable = new Draggable();
draggable.add(area.dialog, area.header);
