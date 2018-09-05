import text from "./text";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";

const main = () => {
  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";

  let _area = document.getElementById(DIALOG_ID);

  if (_area) {
    if (_area.style.opacity <= 0.0) {
      _area.style.opacity = 0.9;
    } else {
      _area.style.opacity = 0.0;
    }
    return;
  }

  const consultAndCreateContentHtml = words => {
    return new Promise(resolve => {
      chrome.storage.local.get(words, meanings => {
        const contentHtml = createContentHtml(words, meanings);
        resolve(contentHtml);
      });
    });
  };

  // dirty...
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
    const contentHtml = descriptions.join('<br/><hr style="width:100%;margin:0px 0px 5px 0px;" />');
    return contentHtml;
  };

  // dirty...
  const createDescriptionHtml = text => {
    return text
      .replace(/\\/g, "\n")
      .replace(/(◆.+)/g, '<font color="#008000">$1</font>')
      .replace(/(■.+)/g, '<font color="#008000">$1</font>')
      .replace(/(【.+?】)/g, '<font color="#000088">$1</font>')
      .replace(/({.+?})/g, '<font color="#000088">$1</font>')
      .replace(/(《.+?》)/g, '<font color="#000088">$1</font>')
      .replace(/\n/g, "<br/>");
  };

  const escapeHtml = str => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  let _lastText = null;
  const _shortCache = new ShortCache(100);

  const reIgnores = /(\r\n|\n|\r|,|\.)/gm;

  document.body.addEventListener("mousemove", ev => {
    const textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY);
    if (!textAtCursor) {
      return;
    }
    if (_lastText == textAtCursor) {
      return;
    }
    const cache = _shortCache.get(textAtCursor);
    if (cache) {
      _area.content.innerHTML = "";
      _area.content.appendChild(cache);
      return;
    }

    const arr = textAtCursor
      .trim()
      .replace(reIgnores, " ")
      .split(" ");
    const linkedWords = text.linkWords(arr);
    const w = text.parseString(arr[0]);
    linkedWords.splice.apply(linkedWords, [0, 0].concat(w));
    consultAndCreateContentHtml(linkedWords).then(contentHtml => {
      const newDom = dom.create(`<div>${contentHtml}</div>`);
      _area.content.innerHTML = "";
      _area.content.appendChild(newDom);
      _shortCache.put(textAtCursor, newDom);
      _lastText = textAtCursor;
    });
  });

  const _styles = {
    all: "initial",
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

  _area = createArea();
  document.body.appendChild(_area.dialog);

  const draggable = new Draggable();
  draggable.add(_area.dialog, _area.header);
};

main();
