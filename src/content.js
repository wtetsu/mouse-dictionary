import string from "./string";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";

let area;

const createDescriptionHtml = text => {
  return text
    .replace(/\\/g, "\n")
    .replace(/(◆.+)/g, '<font color="#008000">$1</font>')
    .replace(/(【.+?】)/g, '<font color="#000088">$1</font>')
    .replace(/\n/g, "<br/>");
};

const consultAndCreateContentHtml = words => {
  return new Promise(resolve => {
    chrome.storage.local.get(words, meanings => {
      let contentHtml = createContentHtml(words, meanings);
      resolve(contentHtml);
    });
  });
};

const createContentHtml = (words, meanings) => {
  let descriptions = [];
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let desc = meanings[word];
    if (desc) {
      let html = '<font color="#000088"><strong>' + escapeHtml(word) + "</strong></font><br/>" + createDescriptionHtml(desc);
      descriptions.push(html);
    }
  }
  if (descriptions.length === 0) {
    descriptions.push('<font color="#000088"><strong>' + escapeHtml(words[0]) + "</strong></font><br/>");
  }
  let contentHtml = descriptions.join('<br/><hr style="width:100%"/>');
  return contentHtml;
};

const escapeHtml = str => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

let _lastText = null;
const _shortCache = new ShortCache(200);

const reIgnores = /(\r\n|\n|\r|,|\.)/gm;

document.body.addEventListener("mousemove", ev => {
  let text = atcursor(ev.target, ev.clientX, ev.clientY);
  if (!text) {
    return;
  }
  if (_lastText == text) {
    return;
  }
  const cache = _shortCache.get(text);
  if (cache) {
    area.content.innerHTML = cache;
    return;
  }

  let arr = text
    .trim()
    .replace(reIgnores, " ")
    .split(" ");
  let linkedWords = string.linkWords(arr);
  let w = string.parseString(arr[0]);
  linkedWords.splice.apply(linkedWords, [0, 0].concat(w));
  consultAndCreateContentHtml(linkedWords).then(contentHtml => {
    area.content.innerHTML = contentHtml;
    _shortCache.put(text, contentHtml);
    _lastText = text;
  });
});

const _styles = {
  width: "200px",
  height: "200px",
  position: "fixed",
  resize: "both",
  overflow: "hidden",
  top: 0,
  left: 0,
  backgroundColor: "#ffffff",
  zIndex: 2147483647,
  fontSize: "0.8em",
  border: "1px solid #A0A0A0",
  textAlign: "left",
  lineHeight: "normal",
  opacity: 0.95
};

const createDialogElement = () => {
  let dialog = document.createElement("div");
  for (let key of Object.keys(_styles)) {
    dialog.style[key] = _styles[key];
  }
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
