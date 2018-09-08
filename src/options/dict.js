import LineReader from "./linereader";
import EijiroParser from "./eijiroparser";
import SimpleDictParser from "./simpledictparser";

const save = dictData => {
  return new Promise(resolve => {
    chrome.storage.local.set(dictData, () => {
      resolve();
    });
  });
};

const load = async ({ file, encoding, format, event }) => {
  let parser = null;
  switch (format) {
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
    throw new Error("Unknown File Format: " + format);
  }

  const ev = event || (() => {});

  return new Promise(resolve => {
    let wordCount = 0;
    var reader = new FileReader();
    reader.onprogress = e => {
      ev({ name: "reading", loaded: e.loaded, total: e.total });
    };
    reader.onload = e => {
      let data = e.target.result;

      var dictData = {};

      let reader = new LineReader(data);
      reader.eachLine(
        line => {
          const hd = parser.addLine(line);
          if (hd) {
            dictData[hd.head] = hd.desc;
            wordCount += 1;

            if (wordCount == 1 || (wordCount >= 1 && wordCount % 100000 === 0)) {
              ev({ name: "loading", count: wordCount, word: hd });
              let tmp = dictData;
              dictData = {};
              return save(tmp);
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

          save(dictData).then(
            () => {
              resolve({ wordCount });
            },
            error => {
              throw new Error(`Error: ${error}`);
            }
          );

          dictData = null;
        }
      );
    };
    reader.readAsText(file, encoding);
  });
};

const registerDefaultDict = async () => {
  const url = chrome.extension.getURL("/data/initial_dict.json");

  try {
    const response = await fetch(url);
    const dictData = await response.json();

    const wordCount = Object.keys(dictData).length;

    await save(dictData);

    return { wordCount };
  } catch (e) {
    console.error(e);
  }
};

export default { load, registerDefaultDict };
