const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const main = (sourcePath, outZipPath) => {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Not found: ${sourcePath}`);
    process.exit(1);
  }

  const stream = fs.createWriteStream(outZipPath, { flags: "w" });

  const archive = startArchiver(sourcePath, stream);

  stream.on("close", () => {
    const size = archive.pointer() / 1_024.0 + " KB";
    console.log(`${outZipPath}: ${size}`);
  });

  archive.finalize();
};

const startArchiver = (targetPath, stream) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("warning", (err) => {
    throw err;
  });
  archive.on("error", (err) => {
    throw err;
  });
  archive.pipe(stream);
  archive.directory(targetPath, false);
  return archive;
};

if (require.main === module) {
  if (process.argv.length <= 2) {
    console.error(`Usage: node archive.js postfix`);
    process.exit(1);
  }

  const postfix = process.argv[2];
  const version = process.env.npm_package_version;
  const sourcePath = `dist-${postfix}`;
  const outZipName = `mouse-dictionary-${postfix}-${version}.zip`;
  const outZipPath = path.join("./", outZipName);

  main(sourcePath, outZipPath);
}
