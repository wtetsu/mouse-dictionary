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
      let html = '<font color="#000088"><strong>' + word + "</strong></font><br/>" + createDescriptionHtml(desc);
      descriptions.push(html);
    }
  }
  if (descriptions.length === 0) {
    descriptions.push('<font color="#000088"><strong>' + words[0] + "</strong></font><br/>");
  }
  let contentHtml = descriptions.join('<br/><hr style="width:100%"/>');
  return contentHtml;
};

let _lastText = null;
const _shortCache = new ShortCache(100);

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

  console.info("new");

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
  dialog.style.opacity = 0.95;
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
