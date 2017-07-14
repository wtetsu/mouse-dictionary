class Draggable {
  constructor() {
    this.targetElement = null;
    this.startingX = null;
    this.startingY = null;
    this.elementX = null;
    this.elementY = null;
    document.body.addEventListener("mousemove", (e) => {
      if (this.targetElement) {
        //console.log("mousemove");
        let x = this.parseInt(e.pageX, 10);
        let y = this.parseInt(e.pageY, 10);
        let left = this.elementX + x - this.startingX;
        let top = this.elementY + y - this.startingY;
        //console.log(`left:${left}, top:${top}`);
        this.targetElement.style.left = left.toString() + "px";
        this.targetElement.style.top = top.toString() + "px";
      }
    });
    document.body.addEventListener("mouseup", (e) => {
      //console.log("mouseup");
      this.targetElement = null;
      this.startingX = null;
      this.startingY = null;
      this.elementX = null;
      this.elementY = null;
      //return false;
    });

  }
  add(elem, titleBar) {
    this.makeElementDraggable(elem, titleBar);
  }
  makeElementDraggable(elem, titleBar) {
    titleBar.addEventListener("mousedown", (e) => {
      //console.log("mousedown");
      this.targetElement = elem;
      this.startingX = this.parseInt(e.pageX, 10);
      this.startingY = this.parseInt(e.pageY, 10);
      this.elementX = this.parseInt(this.targetElement.style.left);
      this.elementY = this.parseInt(this.targetElement.style.top);
      //return false;
    });
  }
  dispose() {
    document.body.removeEventListener("mousemove", this.onmousemove);
  }

  parseInt(str) {
    let r;
    if (str === null || str === undefined || str === "") {
      r = 0;
    } else {
      r = window.parseInt(str, 10);
      if (isNaN(r)) {
        r = 0;
      }
    }
    //console.warn(n);
    return r;
  }
}

//var draggable = new Draggable();
//draggable.add(document.getElementById("area"));


let area = createArea();
document.body.appendChild(area.dialog);

var draggable = new Draggable();
draggable.add(area.dialog, area.header);


function getWordAtPoint(elem, x, y) {
  let word = null;
  if (elem.nodeType == elem.TEXT_NODE) {
    console.log("TEXT_NODE");
    word = getWordAtPointForTextNode(elem, x, y);
  } else {
    console.log("!TEXT_NODE");
    word = getWordAtPointForOthers(elem, x, y);
  }
  return(word);
}

function getWordAtPointForTextNode(elem, x, y) {
  let word = null;
  let range = elem.ownerDocument.createRange();
  range.selectNodeContents(elem);
  let currentPos = 0;
  let endPos = range.endOffset;
  while (currentPos+1 < endPos) {
    range.setStart(elem, currentPos);
    range.setEnd(elem, currentPos+1);
    let rect = range.getBoundingClientRect();
    if (rect.left <= x && rect.right  >= x && rect.top  <= y && rect.bottom >= y) {
      range.expand("word");
      expandRange(range, elem, currentPos);
      word = range.toString();
      //console.log("●getWordAtPointForTextNode●" + word);
      range.detach();
      break;
    }
    currentPos += 1;
  }
  return word;
}

function getWordAtPointForOthers(elem, x, y) {
  let word = null;
  for (var i = 0; i < elem.childNodes.length; i++) {
    var range = elem.childNodes[i].ownerDocument.createRange();
    range.selectNodeContents(elem.childNodes[i]);
    let rect = range.getBoundingClientRect();
    if (rect.left <= x && rect.right  >= x && rect.top  <= y && rect.bottom >= y) {
      range.detach();
      word = getWordAtPoint(elem.childNodes[i], x, y);
      //console.log("●getWordAtPointForOthers●" + word);
      break;
    } else {
      range.detach();
    }
  }
  return word;
}

function expandRange(range, elem, startIndex) {
  for (let i = startIndex+1; i < startIndex+100; i++) {
    try {
      range.setEnd(elem, i);
    } catch (ex) {
      break;
    }
  }
}

function createDescriptionHtml(text) {
  return text.replace(/\\/g, "\n")
             .replace(/(◆.+)/g, '<font color="#008000">$1</font>')
             .replace(/(【.+?】)/g, '<font color="#000088">$1</font>')
             .replace(/\n/g, "<br/>");
}

function createContentHtml(words) {
  return new Promise(function(resolve, reject){
    chrome.storage.local.get(words, (r)=>{
      let contentHtml = "";
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let desc = r[word];
        if (desc) {
          if (contentHtml) {
            contentHtml += "<hr/>";
          }
          contentHtml += '<font color="#000088"><strong>' + word + '</strong></font><br/>';
          contentHtml += createDescriptionHtml(desc);
        }
      }
      resolve(contentHtml)
    });
  });
}

document.body.addEventListener("mousemove", (ev)=>{
  let text = getWordAtPoint(ev.target, ev.x, ev.y);
  if (text) {
    text = text.trim();
  } else {
    return;
  }
  //let words = md.string.parseString(text);
  let words = [];
  let arr = text.split(" ");
  for (let i = 0; i < arr.length; i++) {
    let arr2 = md.string.parseString(arr[i]);
    words = words.concat(arr2);
  }
  console.log(text);
  console.log(words);

  //console.log(words);
  createContentHtml(words).then(function(contentHtml){
    area.content.innerHTML = contentHtml;
  });

  /*
  //console.log(word);
  chrome.storage.local.get([word], (r)=>{
    var desc = r[word];
    var innerHTML = '<font color="#000088"><strong>' + word + '</strong></font><br/>';
    if (desc) {
      innerHTML += createDescriptionHtml(desc);
    } else {
    }
    area.content.innerHTML = innerHTML;
  });
  */
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
  return {dialog, header, content};
}

