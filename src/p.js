


function p() {
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve();
    }, 1000);
  });
}


Promise.all([p()]).then(()=>{
  console.log("aaa");
}).then(()=>{
  console.log("bbb");
});
