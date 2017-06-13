

function getWordAtPoint(elem, x, y) {
  let word = null;
  if (elem.nodeType == elem.TEXT_NODE) {
    word = getWordAtPointForTextNode(elem, x, y);
  } else {
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
    if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
       range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
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

function getWordAtPointForOthers(elem, x, y) {
  let word = null;
  for (var i = 0; i < elem.childNodes.length; i++) {
    var range = elem.childNodes[i].ownerDocument.createRange();
    range.selectNodeContents(elem.childNodes[i]);
    if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
       range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
      range.detach();
      word = getWordAtPoint(elem.childNodes[i], x, y);
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

document.body.addEventListener("mousemove", (ev)=>{
  var w = getWordAtPoint(ev.target, ev.x, ev.y);
  console.log(w);
  //chrome.runtime.sendMessage("...");
});
