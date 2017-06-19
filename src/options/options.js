//alert(localStorage.rules);
//localStorage.rules = "aaa";

function saveDictionaryData(dictData) {
  return new Promise((resolve, reject)=>{
    chrome.storage.local.set(dictData, ()=>{
      resolve();
    });
  })
}

let logArea = document.getElementById("logArea")

function showLog(str) {
  console.log(str);
  logArea.innerText = str;
}

function loadDictionaryData(file) {
  let wordCount = 0;
  var reader = new FileReader();
  reader.onloadstart = ()=>{
    console.log("onloadstart");
  };
  reader.onprogress = (e)=>{
    //console.log("onprogress");
    console.log("読み込中: " + e.loaded + " / " + e.total + "Byte");
  };
  reader.onloadend = ()=> {
    console.log("onloadend");
  };
  reader.onload = (e)=>{
    let data = e.target.result;
    //alert("a file selected(length:" + data.length.toString() + ")");

    var dictData = {};

    let reader = new LineReader(data);
    reader.eachLine((line, i)=>{
      //let arr = line.split("\t");
      let arr = line.split(" /// ");
      if (arr.length >= 2) {
        let word = arr[0].trim();
        let desc = arr[1].trim();
        dictData[word] = desc;
        wordCount += 1;
      }

      let r = true;
      if (i >= 1 && i % 100 === 0) {
        showLog(line);
        saveDictionaryData(dictData).then(()=>{
          // succeeded
        }, (error)=>{
          showLog(`Error: ${error}`);
        });
        dictData = {};
        //r = false; // break
      }
      return r;
    }, () => {
      // finished
      saveDictionaryData(dictData).then(null, (error)=>{
        showLog(`Error: ${error}`);
      });
      showLog("Finished(" + wordCount.toString() + "単語登録)");
      dictData = null;
    });
  };
  reader.readAsText(file, "shift-jis");  
}

if (typeof(document) !== "undefined") {
  document.getElementById("dictdata").addEventListener("change", ()=>{
    //alert("hello!");
    var file = document.getElementById("dictdata").files[0];
    setTimeout(()=>{
      loadDictionaryData(file);
    }, 0);
  });
}

chrome.storage.sync.set({key00: "value00"}, ()=>{
  //alert("key00 valye set!");
});


