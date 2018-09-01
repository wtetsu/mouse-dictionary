const swal = require("sweetalert");
const LineReader = require("./linereader");
const text = require("./text.js");

function saveDictionaryData(dictData) {
  return new Promise(resolve => {
    chrome.storage.local.set(dictData, () => {
      resolve();
    });
  });
}

let logArea = document.getElementById("logArea");

function showLog(str) {
  console.log(str);
  logArea.innerText = str;
}

function loadDictionaryData(file) {
  let wordCount = 0;
  var reader = new FileReader();
  reader.onloadstart = () => {
    console.log("onloadstart");
  };
  reader.onprogress = e => {
    console.log("loding: " + e.loaded + " / " + e.total + "Byte");
  };
  reader.onloadend = () => {
    console.log("onloadend");
  };
  reader.onload = e => {
    console.log("onload!!");
    let fileFormat = document.getElementById("fileformat").value;
    let deimiter = null;
    switch (fileFormat) {
      case "PDIC":
        break;
      case "PDIC_LINE":
        deimiter = " /// ";
        break;
      case "TSV":
        deimiter = "\t";
        break;
      case "EIJI":
        break;
    }
    if (deimiter === null) {
      return;
    }

    let data = e.target.result;

    var dictData = {};

    let reader = new LineReader(data);
    reader.eachLine(
      (line, i) => {
        console.log("eachLine");

        const arr = line.split(deimiter);
        let word, desc;
        if (arr.length >= 2) {
          word = arr[0].trim();
          desc = arr[1].trim();
          dictData[word] = desc;
          wordCount += 1;
        }
        showLog(i);
        if (wordCount >= 1 && wordCount % 1000 === 0) {
          showLog(text("progressRegister", wordCount, word));
          let d = dictData;
          dictData = {};
          return saveDictionaryData(d);
        }
      },
      () => {
        // finished
        saveDictionaryData(dictData).then(null, error => {
          showLog(`Error: ${error}`);
        });
        showLog(text("finishRegister", wordCount));
        dictData = null;
      }
    );
  };
  let fileEncoding = document.getElementById("fileEncoding").value;
  reader.readAsText(file, fileEncoding);
}

if (typeof document !== "undefined") {
  let wordTestArea = document.getElementById("wordTestArea");
  let wordTestInput = document.getElementById("wordTestInput");
  wordTestInput.addEventListener("keyup", () => {
    let word = wordTestInput.value;
    chrome.storage.local.get([word], r => {
      let desc = r[word] || "?";
      if (desc) {
        wordTestArea.innerText = desc;
      }
    });
  });

  document.getElementById("load").addEventListener("click", () => {
    console.log("load");
    const file = document.getElementById("dictdata").files[0];
    if (file) {
      loadDictionaryData(file);
    } else {
      swal({
        title: text("selectDictFile"),
        icon: "info"
      });
    }
  });

  document.getElementById("clear").addEventListener("click", () => {
    swal({
      text: text("clearAllDictData"),
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        chrome.storage.local.clear(function() {
          alert(willDelete);
          swal({
            text: text("finishedClear"),
            icon: "success"
          });
        });
      }
    });
  });
}
