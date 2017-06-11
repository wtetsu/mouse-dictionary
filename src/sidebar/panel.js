
class LineReader {
  constructor(data) {
    this.data = data;
    this.lineFeedCode = this.detectLineFeedCode(data);
  }

  detectLineFeedCode(data) {
    let code = null;
    let index = data.indexOf("\n");
    if (index >= 0) {
      if (data[index-1] == "\r") {
        code = "\r\n";
      } else {
        code = "n";
      }
    }
    return code;
  }

  eachLine(fnEachLine, fnFinished) {
    const LF = this.lineFeedCode;

    let current = 0;
    for (let i = 0; ; i++) {
      let nextLf = this.data.indexOf(LF, current);
      if (nextLf === -1) {
        break;
      }
      let line = this.data.substring(current, nextLf);
      let r = fnEachLine(line, i);
      if (r === false) {
        break;
      }
      current  = nextLf + 2;
    }
    if (fnFinished) {
      fnFinished();
    }
  }
}

var myWindowId;

function createHtml(word, description) {
  let html = "<div>";
  html += "<h2>" + word + "</h2>";

  html += description.replace(/\\/g, "<br/>");

  html += "</div>";
  return html;
}

function getWords(range) {
  let words = [];
  let offset = range.startOffset;

  let startIndex = offset;
  let endIndex = offset;

  let reWordChars = /[0-9A-Za-z_-]/;

  for (;;) {
    if (startIndex < 0) {
      break;
    }
    try {
      range.setStart(range.startContainer, startIndex);
      range.setEnd(range.startContainer, startIndex+1);
    } catch (ex) {
      break;
    }
    if (!range.toString().match(reWordChars)) {
      startIndex += 1;
      break;
    }
    startIndex -= 1;
  }

  for (;;) {
    try {
      range.setStart(range.startContainer, endIndex);
      range.setEnd(range.startContainer, endIndex+1);
    } catch (ex) {
      break;
    }
    if (!range.toString().match(reWordChars)) {
      range.setStart(range.startContainer, startIndex);
      range.setEnd(range.startContainer, endIndex);
      let newWord = range.toString();
      if (newWord) {
        words.unshift(newWord);

        if (words.length >= 5) {
          break;
        }
      }
    }
    endIndex += 1;
  }

  return words;
}

browser.windows.getCurrent({populate: true}).then((windowInfo) => {
  myWindowId = windowInfo.id;

  document.getElementById("btn01").addEventListener("click", ()=>{
    var file = document.getElementById("file01").files[0];
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
      console.log(data.length);

      var dictData = {};

      let reader = new LineReader(data);
      reader.eachLine((line, i)=>{
        let arr = line.split(" /// ");
        if (arr.length >= 2) {
          let word = arr[0].trim();
          let desc = arr[1].trim();
          dictData[word] = desc;
        }

        let r = true;
        if (i % 1000=== 0) {
          console.log(i);
        }
        if (i >= 1 && i % 10000 === 0) {
          //console.log(dictData);
          browser.storage.local.set(dictData).then(()=>{
            // succeeded
          }, (error)=>{
            console.log(`Error: ${error}`);
          });
          dictData = {};

          //r = false; // break
        }
        return r;
      }, () => {
        // finished
        console.log(dictData);
        browser.storage.local.set(dictData).then(null, (error)=>{
          console.log(`Error: ${error}`);
        });
        dictData = null;
      });
    };
    reader.readAsText(file, "shift-jis");  
  });
  
  function getWordDescription(word)  {
    //return browser.storage.local.get(word);
    return browser.storage.local.get(word).then((r)=>{
      return r[word];
    });
  }

  function showWords(words)  {
    let plist = [];
    for (let i = 0; i < words.length; i++) {
      plist.push(getWordDescription(words[i]));
      //plist.push(getWordDescription(words[i].toLowerCase()));
    }
    Promise.all(plist).then((r)=>{
      let html = "";
      for (let i = 0; i < words.length; i++) {
        let desc = r[i];
        if (desc) {
          html += createHtml(words[i], desc);
          html += "<hr/>";
        }
      }
      document.getElementById("dict").innerHTML = html;
    });
  }

  function processWord(word) {
    let newWords = [];
    newWords.push(word);
    let lWord = word.toLowerCase();
    if (word !== lWord) {
      newWords.push(lWord);
    }
    return newWords;
  }

  function processWords(words) {
    let newWords = [];
    for (let i = 0; i < words.length; i++) {
      newWords = newWords.concat(processWord(words[i]));
    }
    return newWords;
  }

  function wait() {
    browser.tabs.executeScript({
      //code: makeItGreen
      file: "content.js"
    }).then((r)=>{
      let words = r[0];
      //console.log("latest words is...");
      let processedWords = processWords(words);
      console.log(processedWords);
      showWords(processedWords);
      wait();
    });
  }
  
  document.getElementById("btn02").addEventListener("click", ()=>{
    // let word = document.getElementById("tbx01").value;
    // showWord(word);
    wait();
  });
});
