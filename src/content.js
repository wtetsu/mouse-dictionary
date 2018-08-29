const string = require("./string");
const Draggable = require("./draggable");

let area = createArea();
document.body.appendChild(area.dialog);

var draggable = new Draggable();
draggable.add(area.dialog, area.header);

function getWordAtPoint(elem, x, y) {
  let word = null;
  if (elem.nodeType === elem.TEXT_NODE) {
    word = getWordAtPointForTextNode(elem, x, y);
  } else {
    word = getWordAtPointForOthers(elem, x, y);
  }
  return word;
}

function getWordAtPointForTextNode(elem, x, y) {
  let word = null;
  let range = elem.ownerDocument.createRange();
  range.selectNodeContents(elem);
  let currentPos = 0;
  let endPos = range.endOffset;
  while (currentPos + 1 < endPos) {
    range.setStart(elem, currentPos);
    range.setEnd(elem, currentPos + 1);
    let rect = range.getBoundingClientRect();
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
}

function insideRect(rect, x, y) {
  return rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y;
}

function getWordAtPointForOthers(elem, x, y) {
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
}

function expandRange(range, elem, startIndex) {
  for (let i = startIndex + 1; i < startIndex + 100; i++) {
    try {
      range.setEnd(elem, i);
    } catch (ex) {
      break;
    }
  }
}

function createDescriptionHtml(text) {
  return text
    .replace(/\\/g, "\n")
    .replace(/(◆.+)/g, '<font color="#008000">$1</font>')
    .replace(/(【.+?】)/g, '<font color="#000088">$1</font>')
    .replace(/\n/g, "<br/>");
}

function consultAndCreateContentHtml(words) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(words, meanings => {
      let contentHtml = createContentHtml(words, meanings);
      resolve(contentHtml);
    });
  });
}

function createContentHtml(words, meanings) {
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
}

document.body.addEventListener("mousemove", ev => {
  let text = getWordAtPoint(ev.target, ev.x, ev.y);
  if (text) {
    text = text.trim();
  } else {
    return;
  }
  let words = [];
  let arr = text.replace(",", "").split(" ");
  let linkedWords = string.linkWords(arr);
  let w = string.parseString(arr[0]);
  //linkedWords.splice.apply(linkedWords, [1, 0].concat(w));
  linkedWords.splice.apply(linkedWords, [0, 0].concat(w));
  consultAndCreateContentHtml(linkedWords).then(function(contentHtml) {
    area.content.innerHTML = contentHtml;
  });
});

function createDialogElement() {
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
  return dialog;
}

function createHeaderElement() {
  let header = document.createElement("div");
  header.innerText = "Mouse Dictionary";
  header.style.cursor = "pointer";
  header.style.backgroundColor = "#EBEBEB";
  return header;
}

function createContentElement() {
  let content = document.createElement("div");
  return content;
}

function createArea() {
  let dialog = createDialogElement();
  let header = createHeaderElement();
  let content = createContentElement();
  dialog.appendChild(header);
  dialog.appendChild(content);
  return { dialog, header, content };
}
