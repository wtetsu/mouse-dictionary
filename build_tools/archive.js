const fs = require("fs");
const archiver = require("archiver");

const main = () => {
  const postfix = process.argv[2];
  const targetPath = `dist-${postfix}/`;
  const zipPath = __dirname + `/mouse-dictionary-${postfix}.zip`;
  const stream = fs.createWriteStream(zipPath);

  const archive = startArchiver(targetPath, stream);

  stream.on("close", () => {
    const size = archive.pointer() / 1_024.0 + " KB";
    console.log(`${zipPath}: ${size}`);
  });

  archive.finalize();
};

const startArchiver = (targetPath, stream) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("warning", err => {
    throw err;
  });
  archive.on("error", err => {
    throw err;
  });
  archive.pipe(stream);
  archive.directory(targetPath, false);
  return archive;
};

main();
