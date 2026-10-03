/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Package a browser extension.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const main = (sourcePath, outZipPath) => {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Not found: ${sourcePath}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(sourcePath, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

  const entries = files.map((file) => ({
    name: path.relative(sourcePath, file).replaceAll(path.sep, "/"),
    data: fs.readFileSync(file),
    mtime: fs.statSync(file).mtime,
  }));
  fs.writeFileSync(outZipPath, makeZip(entries));

  const size = fs.statSync(outZipPath).size / 1_024.0 + " KB";
  console.log(`${outZipPath}: ${size}`);
};

// Minimal ZIP writer (no ZIP64; every file and the archive must be < 4 GiB)
const makeZip = (entries) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, data, mtime } of entries) {
    const nameBuf = Buffer.from(name, "utf-8");
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;

    const header = {
      method: useDeflate ? 8 : 0,
      ...toDosDateTime(mtime),
      crc: zlib.crc32(data),
      compressedSize: body.length,
      size: data.length,
      nameLength: nameBuf.length,
    };

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    writeCommonHeader(local, 4, header);
    localParts.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    writeCommonHeader(central, 6, header);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const centralSize = centralParts.reduce((sum, b) => sum + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, ...centralParts, end]);
};

// Fields shared by local file headers and central directory headers
const writeCommonHeader = (buf, pos, h) => {
  buf.writeUInt16LE(20, pos); // version needed to extract
  buf.writeUInt16LE(0x0800, pos + 2); // flags: UTF-8 file name
  buf.writeUInt16LE(h.method, pos + 4);
  buf.writeUInt16LE(h.time, pos + 6);
  buf.writeUInt16LE(h.date, pos + 8);
  buf.writeUInt32LE(h.crc, pos + 10);
  buf.writeUInt32LE(h.compressedSize, pos + 14);
  buf.writeUInt32LE(h.size, pos + 18);
  buf.writeUInt16LE(h.nameLength, pos + 22);
};

const toDosDateTime = (d) => ({
  time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
});

if (import.meta.main) {
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
