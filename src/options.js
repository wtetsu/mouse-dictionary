import swal from "sweetalert";
import LineReader from "./linereader";
import text from "./text.js";

const saveDictionaryData = dictData => {
  return new Promise(resolve => {
    chrome.storage.local.set(dictData, () => {
      resolve();
    });
  });
};

const logArea = document.getElementById("logArea");

const showLog = str => {
  logArea.innerText = str;
};

const loadDictionaryData = file => {
  let wordCount = 0;
  var reader = new FileReader();
  reader.onprogress = e => {
    showLog("loding: " + e.loaded + " / " + e.total + "Byte");
  };
  reader.onload = e => {
    let fileFormat = document.getElementById("fileformat").value;
    let deimiter = null;
    switch (fileFormat) {
      // case "PDIC":
      //   break;
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
      line => {
        const arr = line.split(deimiter);
        let word, desc;
        if (arr.length >= 2) {
          word = arr[0].trim();
          desc = arr[1].trim();
          dictData[word] = desc;
          wordCount += 1;
        }

        if (wordCount >= 1 && wordCount % 100000 === 0) {
          showLog(text("progressRegister", wordCount, word));
          let tmp = dictData;
          dictData = {};
          return saveDictionaryData(tmp);
        }
      },
      () => {
        // finished
        saveDictionaryData(dictData).then(null, error => {
          showLog(`Error: ${error}`);
        });
        showLog(text("finishRegister", wordCount));
        dictData = null;
        document.getElementById("load").removeAttribute("disabled");
      }
    );
  };
  let fileEncoding = document.getElementById("fileEncoding").value;
  reader.readAsText(file, fileEncoding);
};

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
        chrome.storage.local.clear();
        swal({
          text: text("finishedClear"),
          icon: "success"
        });
      }
    });
  });
}
