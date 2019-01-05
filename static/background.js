chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: "./main.js"
  });
});

chrome.runtime.onConnectExternal.addListener(function(receivePort) {
  receivePort.onMessage.addListener(message => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        chrome.tabs.sendMessage(tab.id, { message: message });
      }
    });
  });
});
