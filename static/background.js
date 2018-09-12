chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: "./content.js"
  });
});
