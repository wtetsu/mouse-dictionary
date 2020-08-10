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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "open_pdf":
      chrome.runtime.openOptionsPage(() => {
        sendResponse();
      });
      break;
  }
});
