import swal from "sweetalert";
import LineReader from "./linereader";
import resource from "./resource";
import EijiroParser from "./eijiroparser";
import SimpleDictParser from "./simpledictparser";

const KEY_LOADED = "**** loaded ****";

chrome.storage.local.get(KEY_LOADED, r => {
  if (!r[KEY_LOADED]) {
    swal({
      text: resource("confirmLoadInitialDict"),
      icon: "info",
      buttons: true,
      closeOnClickOutside: false
    }).then(willLoad => {
      if (willLoad) {
        loadInitialDict();
      }
    });
  }
});

const loadInitialDict = async () => {
  makeControlsBusy(true);
  const url = chrome.extension.getURL("/data/initial_dict.json");

  try {
    const response = await fetch(url);
    const dictData = await response.json();

    const wordCount = Object.keys(dictData).length;

    await saveDictionaryData(dictData);

    swal({
      text: resource("finishRegister", wordCount),
      icon: "success"
    });

    makeControlsBusy(false);
    updateDictDataUsage();
    const loaded = {};
    loaded[KEY_LOADED] = true;
    chrome.storage.local.set(loaded);
  } catch (e) {
    console.error(e);
    makeControlsBusy(false);
  }
};

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
  makeControlsBusy(true);

  let wordCount = 0;
  var reader = new FileReader();
  reader.onprogress = e => {
    showLog("loding: " + e.loaded + " / " + e.total + "Byte");
  };
  reader.onload = e => {
    let fileFormat = document.getElementById("fileformat").value;
    let parser = null;
    switch (fileFormat) {
      case "TSV":
        parser = new SimpleDictParser("\t");
        break;
      case "PDIC_LINE":
        parser = new SimpleDictParser(" /// ");
        break;
      case "EIJIRO":
        parser = new EijiroParser();
        break;
    }
    if (parser === null) {
      return;
    }

    let data = e.target.result;

    var dictData = {};

    let reader = new LineReader(data);
    reader.eachLine(
      line => {
        const hd = parser.addLine(line);
        if (hd) {
          dictData[hd.head] = hd.desc;
          wordCount += 1;

          if (wordCount >= 1 && wordCount % 100000 === 0) {
            showLog(resource("progressRegister", wordCount, hd.head));
            let tmp = dictData;
            dictData = {};
            return saveDictionaryData(tmp);
          }
        }
      },
      () => {
        // finished
        const hd = parser.flush();
        if (hd) {
          dictData[hd.head] = hd.desc;
          wordCount += 1;
        }

        saveDictionaryData(dictData).then(null, error => {
          showLog(`Error: ${error}`);
        });
        showLog("");
        swal({
          text: resource("finishRegister", wordCount),
          icon: "success"
        });

        dictData = null;
        makeControlsBusy(false);
        updateDictDataUsage();
        const loaded = {};
        loaded[KEY_LOADED] = true;
        chrome.storage.local.set(loaded);
      }
    );
  };
  let fileEncoding = document.getElementById("fileEncoding").value;
  reader.readAsText(file, fileEncoding);
};

const makeControlsBusy = disabled => {
  if (disabled) {
    document.getElementById("load").setAttribute("disabled", "disabled");
    document.getElementById("clear").setAttribute("disabled", "disabled");
    document.getElementById("dictdata").setAttribute("disabled", "disabled");
    document.getElementById("loading").style.display = "inline";
  } else {
    document.getElementById("load").removeAttribute("disabled");
    document.getElementById("clear").removeAttribute("disabled");
    document.getElementById("dictdata").removeAttribute("disabled");
    document.getElementById("loading").style.display = "none";
  }
};

const updateDictDataUsage = () => {
  chrome.storage.local.getBytesInUse(null, byteSize => {
    const kb = Math.floor(byteSize / 1024).toLocaleString();
    document.getElementById("dictSize").innerText = resource("dictDataUsage", kb);
  });
};

if (typeof document !== "undefined") {
  window.onload = () => {
    document.getElementById("load").addEventListener("click", () => {
      const file = document.getElementById("dictdata").files[0];
      if (file) {
        loadDictionaryData(file);
      } else {
        swal({
          title: resource("selectDictFile"),
          icon: "info"
        });
      }
    });

    document.getElementById("clear").addEventListener("click", () => {
      swal({
        text: resource("clearAllDictData"),
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(willDelete => {
        if (willDelete) {
          makeControlsBusy(true);
          chrome.storage.local.clear(() => {
            updateDictDataUsage();
            swal({
              text: resource("finishedClear"),
              icon: "success"
            });
            makeControlsBusy(false);
          });
        }
      });
    });

    updateDictDataUsage();
  };
}

window.onerror = msg => {
  swal({
    text: msg,
    icon: "error"
  });
};
