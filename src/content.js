import string from "./string";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";

const main = () => {
  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";

  let area = document.getElementById(DIALOG_ID);

  if (area) {
    if (area.style.opacity <= 0.0) {
      area.style.opacity = 0.9;
    } else {
      area.style.opacity = 0.0;
    }
    return;
  }

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
        const contentHtml = createContentHtml(words, meanings);
        resolve(contentHtml);
      });
    });
  };

  const createContentHtml = (words, meanings) => {
    const descriptions = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = meanings[word];
      if (desc) {
        const html = '<font color="#000088"><strong>' + escapeHtml(word) + "</strong></font><br/>" + createDescriptionHtml(desc);
        descriptions.push(html);
      }
    }
    if (descriptions.length === 0) {
      descriptions.push('<font color="#000088"><strong>' + escapeHtml(words[0]) + "</strong></font><br/>");
    }
    const contentHtml = descriptions.join('<br/><hr style="width:100%"/>');
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
    const text = atcursor(ev.target, ev.clientX, ev.clientY);
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

    const arr = text
      .trim()
      .replace(reIgnores, " ")
      .split(" ");
    const linkedWords = string.linkWords(arr);
    const w = string.parseString(arr[0]);
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
    const dialog = document.createElement("div");
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
    const content = document.createElement("div");
    return content;
  };

  const createArea = () => {
    const dialog = createDialogElement();
    const header = createHeaderElement();
    const content = createContentElement();
    dialog.appendChild(header);
    dialog.appendChild(content);

    dialog.id = DIALOG_ID;
    return { dialog, header, content };
  };

  area = createArea();
  document.body.appendChild(area.dialog);

  const draggable = new Draggable();
  draggable.add(area.dialog, area.header);
};

main();
