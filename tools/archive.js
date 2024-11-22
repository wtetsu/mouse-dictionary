/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Package a browser extension.

const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");

const main = (sourcePath, outZipPath) => {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Not found: ${sourcePath}`);
    process.exit(1);
  }

  const zip = new AdmZip();
  zip.addLocalFolder(sourcePath);
  zip.writeZip(outZipPath);

  const size = fs.statSync(outZipPath).size / 1_024.0 + " KB";
  console.log(`${outZipPath}: ${size}`);
};

if (require.main === module) {
  if (process.argv.length <= 2) {
    console.error("Usage: node archive.js postfix");
    process.exit(1);
  }

  const postfix = process.argv[2];
  const version = process.env.npm_package_version;
  const sourcePath = `dist-${postfix}`;
  const outZipName = `mouse-dictionary-${postfix}-${version}.zip`;
  const outZipPath = path.join("./", outZipName);

  main(sourcePath, outZipPath);
}
