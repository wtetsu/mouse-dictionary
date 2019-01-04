chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: "./main.js"
  });
});

// const sendPort = chrome.runtime.connect({ name: "knockknock" });

// // long-lived connections
// chrome.runtime.onConnectExternal.addListener(function(receivePort) {
//   receivePort.onMessage.addListener(msg => {
//     console.info("Mouse Dictionary:" + msg);
//     sendPort.postMessage({ joke: "Knock knock" });
//   });
// });

chrome.runtime.onConnectExternal.addListener(function(receivePort) {
  receivePort.onMessage.addListener(message => {
    console.info("background.js:" + message);

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        chrome.tabs.sendMessage(tab.id, { message: message });
      }
    });
  });
});
