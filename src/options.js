const LineReader = require("./linereader");
const swal = require("sweetalert");

function saveDictionaryData(dictData) {
  return new Promise((resolve, reject) => {
    // resolve();
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
    //console.log("onprogress");
    console.log("読み込中: " + e.loaded + " / " + e.total + "Byte");
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
    console.log("a file selected(length:" + data.length.toString() + ")");

    var dictData = {};

    let reader = new LineReader(data);
    reader.eachLine(
      (line, i) => {
        let arr = line.split(deimiter);
        let word, desc;
        if (arr.length >= 2) {
          word = arr[0].trim();
          desc = arr[1].trim();
          dictData[word] = desc;
          wordCount += 1;
        }
        //if (wordCount >= 1 && i % wordCount === 1000) {
        if (wordCount >= 1 && i % 1000 === 0) {
          showLog(i.toString() + "単語登録 " + word);
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
        showLog("Finished(" + wordCount.toString() + "単語登録完了) ");
        dictData = null;
      }
    );
  };
  let fileEncoding = document.getElementById("fileEncoding").value;
  reader.readAsText(file, fileEncoding);
}

if (typeof document !== "undefined") {
  // document.getElementById("dictdata").addEventListener("change", () => {
  //   var file = document.getElementById("dictdata").files[0];
  //   setTimeout(() => {
  //     loadDictionaryData(file);
  //   }, 0);
  // });

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
      swal("辞書ファイルを選択してください。");
    }
  });

  document.getElementById("clear").addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      alert("cleared!");
    });
  });
}
