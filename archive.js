var fs = require('fs');
var archiver = require('archiver');

const browser = process.env.NODE_ENV; // target browser (chrome, firefox).

var output = fs.createWriteStream(__dirname + `/${process.env.npm_package_name}-${browser}.zip`);
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() / 1000000.0 + ' total MBytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

output.on('end', function() {
  console.log('Data has been drained');
});

archive.on('warning', function(err) {
    throw err;
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.directory(`dist-${browser}/`, false);

archive.finalize();

