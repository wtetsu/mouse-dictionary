/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ext from "../main/lib/ext";
import ExpiringQueue from "./queue";
import generateUniqueId from "./unique";

const api = ext();

if (BROWSER === "chrome") {
  api.action.onClicked.addListener((tab) => {
    api.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["main.js"],
    });
  });
} else {
  api.browserAction.onClicked.addListener(() => {
    api.tabs.executeScript({
      file: "./main.js",
    });
  });
}

// cross-extension messaging
api.runtime.onMessageExternal.addListener((message) => {
  sendToActiveTabs((tabId) => api.tabs.sendMessage(tabId, { message: message }));
});

// Shortcut key handling
api.commands.onCommand.addListener((command) => {
  switch (command) {
    case "scroll_up":
      sendToActiveTabs((tabId) => api.tabs.sendMessage(tabId, { message: { type: "scroll_up" } }));
      break;
    case "scroll_down":
      sendToActiveTabs((tabId) => api.tabs.sendMessage(tabId, { message: { type: "scroll_down" } }));
      break;
    case "activate_extension":
      // Workaround for Vivaldi (see #84)
      sendToActiveTabs((tabId) =>
        api.scripting.executeScript({
          target: { tabId },
          files: ["main.js"],
        }),
      );
      break;
  }
});

// PDF handling
const queue = new ExpiringQueue(1000 * 30);
api.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request?.type) {
    case "open_pdf": {
      const id = generateUniqueId();
      queue.push(id, request.payload);
      // Rejects when no options page is open yet; the newly opened page will pick up the PDF itself
      api.runtime.sendMessage({ type: "prepare_pdf" }).catch(() => {});
      api.runtime.openOptionsPage().then(() => sendResponse());
      // Keep the message channel open for the asynchronous response
      return true;
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

const sendToActiveTabs = async (send) => {
  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  for (const tab of tabs) {
    // Tabs where the content script is unavailable reject; they can be safely ignored
    send(tab.id).catch(() => {});
  }
};
