chrome.runtime.onMessage.addListener((request, sender, callback)=>{
    chrome.tabs.getSelected(function(tab) {
      console.log(request);
    });
  }
);

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    file: "./content.js"
  }, (promise)=>{
    //alert(promise);
  });
});
