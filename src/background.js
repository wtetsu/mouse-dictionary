chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log("!!!!!!!!!!!!!");
  chrome.tabs.getSelected(function(tab) {
    console.log("@@@@@@@@@@");
    console.log(request);
  });
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    file: "./content.js"
  });
});

//alert(localStorage.rules); // これは取得できる

chrome.storage.sync.get(["key00"], r => {
  console.log(r.key00);
});
