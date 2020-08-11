chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: "./main.js",
  });
});

// cross-extension messaging
chrome.runtime.onMessageExternal.addListener((message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      chrome.tabs.sendMessage(tab.id, { message: message });
    }
  });
});

const _pdfIdQueue = new Set();
const _pdfData = new Map();

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request?.type) {
    case "open_pdf": {
      const id = generateUniqueId(32);
      _pdfData.set(id, request.payload);
      _pdfIdQueue.add(id);
      setTimeout(() => {
        _pdfIdQueue.delete(id);
        _pdfData.delete(id);
      }, 30000);
      chrome.runtime.openOptionsPage(() => {
        sendResponse();
      });
      break;
    }
    case "shift_pdf_id": {
      let frontId = null;
      if (_pdfIdQueue.size >= 1) {
        frontId = _pdfIdQueue.values().next().value;
        _pdfIdQueue.delete(frontId);
      }
      sendResponse(frontId);
      break;
    }
    case "get_pdf_data": {
      const pdfData = _pdfData.get(request.id);
      sendResponse(pdfData);
      break;
    }
  }
});

const LETTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ch = () => {
  const index = Math.floor(Math.random() * LETTERS.length);
  return LETTERS[index];
};

const generateUniqueId = (digits) => {
  const arr = [];
  for (let i = 0; i < digits; i++) {
    arr.push(ch());
  }
  return arr.join("");
};
