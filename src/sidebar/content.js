
if (typeof(mod) === "undefined") {
  mod = {};
  mod.executionCount = 0;
  mod.latestWords = null;
}
mod.executionCount += 1;

console.log(mod.executionCount);

if (mod.executionCount === 1) {
  mod.getWords = (range) => {
    let words = [];
    let offset = range.startOffset;

    let startIndex = offset;
    let endIndex = offset;

    let reWordChars = /[0-9A-Za-z_-]/;

    for (;;) {
      if (startIndex < 0) {
        startIndex = 0;
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
        console.log("startIndex:" + startIndex)
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
  };

  console.log("document.body.addEventListener");
  document.body.addEventListener("mousemove", (e)=>{
    //console.log("mousemove");
    let parent = e.rangeParent;
    let range = parent.ownerDocument.createRange();
    range.setStart(e.rangeParent, e.rangeOffset);
    range.setEnd(e.rangeParent, e.rangeOffset);  
    mod.latestWords = mod.getWords(range);
    //console.log(words);

    if (mod.callback && mod.latestWords && mod.latestWords.length >= 1) {
      console.log("callback execution");
      //console.log(mod.latestWords);
      mod.callback(mod.latestWords);
    }
  });

  mod.register = (callback)=>{
    mod.callback = callback;
  };

  mod.getWord = ()=>{
    //console.log("getWord");
    return new Promise((resolve) => {
      mod.register((words)=>{
        console.log("called back!");
        resolve(words);
      });
    });
  };
}

// return words to sidebar
mod.getWord();

// let fn = function() {
//   console.log("AAAAAAAAAAAAAAAAAAAAAAA");
// };
// fn;
// document.body.style.border = "5px solid red";


// let i = 0;
// document.body.addEventListener("mousemove", (e)=>{
//   // let parent = e.rangeParent;
  
//   // //console.log(e.rangeOffset);

//   // let range = parent.ownerDocument.createRange();
//   // range.setStart(e.rangeParent, e.rangeOffset);
//   // range.setEnd(e.rangeParent, e.rangeOffset);  

//   //getWord(range)
//   //console.log(getWords(range));


//   // console.log(sidebar);

//   // browser.sidebarAction.setTitle("HELLO" + i.toString());

//   // console.log("aaaaaaaaaaa" + i.toString());
//   // i++;
  
// });

//window.xxx = "hello!!!!!!!!";
