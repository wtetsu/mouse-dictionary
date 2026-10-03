/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Convert license.json to a simple html file.

import fs from "node:fs";

type LicenseRecord = { licenses: string; publisher?: string; repository?: string; url?: string };

const main = (licenseJsonPath: string) => {
  const licenseRecords = readJson(licenseJsonPath);

  const { licenseContent, summary } = makeLicenseContent(licenseRecords);
  printSummary(summary);

  const htmlContent = makeHtmlContent(licenseContent);

  fs.writeFileSync("license.html", htmlContent);
};

const makeLicenseContent = (licenseRecords: Record<string, LicenseRecord>) => {
  const keys = Object.keys(licenseRecords);
  keys.sort();

  const summary: Record<string, number> = {};

  let licenseContent = "<ul>";
  for (const key of keys) {
    const idx = key.lastIndexOf("@");
    const title = key.substring(0, idx);
    const version = key.substring(idx + 1);

    const record = licenseRecords[key];
    const licenses = record.licenses;
    const name = record.publisher ?? "Link";
    const href = record.repository ?? record.url;

    if (!summary[licenses]) {
      summary[licenses] = 0;
    }
    summary[licenses] += 1;

    licenseContent += `  <li><a href="${href}" target="_blank" rel="noopener noreferrer" title="${version}">${title}</a><span class="license">(${licenses})</span> <span class="publisher">${name}</span></li>\n`;
  }

  return { licenseContent, summary };
};

const printSummary = (summary: Record<string, number>) => {
  console.log("# Summary");
  const keys = Object.keys(summary);
  keys.sort();

  const records = [];
  for (const key of keys) {
    records.push({ key, count: summary[key] });
  }
  records.sort((a, b) => b.count - a.count);

  for (const record of records) {
    console.log(`${record.count} ${record.key}`);
  }
};

const makeHtmlContent = (licenseContent: string) => {
  return `
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <title>License</title>
     <style>
       ul {
         list-style-type: none;
       }
       li {
         margin-bottom: 0.5em;
       }
       a {
         color: #000;
         text-decoration: none;
       }
       a:hover{
         text-decoration: underline;
       }
       .version {
         font-size: 0.8em;
         color: #4a4a4a;
       }
       .license {
         font-size: 0.8em;
         color: #4a4a4a;
       }
       .publisher {
         font-size: 0.5em;
         color: #4a4a4a;
       }
     </style>
   </head>
   <body>
     ${licenseContent}
   </body>
   </html>
   `;
};

const readJson = (fileName: string) => {
  return JSON.parse(fs.readFileSync(fileName, "utf-8"));
};

if (import.meta.main) {
  if (process.argv.length <= 2) {
    console.error("Usage: node make_license_html.ts license_file_path");
    process.exit(1);
  }

  const licenseFilePath = process.argv[2];

  main(licenseFilePath);
}
