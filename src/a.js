let LineReader = require("./linereader.js");

let reader = new LineReader("abc\ndef\nghj");

reader.eachLine((line)=>{
  console.log(line);

  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve();
    }, 1000);
  });
}, ()=>{
  console.log("finished");
});
