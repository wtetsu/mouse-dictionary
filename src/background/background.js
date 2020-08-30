/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ExpiringQueue from "./queue";
import uniqueId from "./unique";

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

// PDF handling
const queue = new ExpiringQueue(1000 * 30);
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request?.type) {
    case "open_pdf": {
      const id = uniqueId(32);
      queue.push(id, request.payload);
      chrome.runtime.sendMessage({ type: "prepare_pdf" });
      chrome.runtime.openOptionsPage(() => {
        sendResponse();
      });
      break;
    }
    case "shift_pdf_id": {
      const frontId = queue.shiftId();
      sendResponse(frontId);
      break;
    }
    case "get_pdf_data": {
      const pdfData = queue.get(request.id);
      sendResponse(pdfData);
      break;
    }
  }
});
