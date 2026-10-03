/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ext from "../lib/ext";
import ribbon from "../lib/ribbon";
import res from "./resource";

const invoke = async () => {
  const [updateRibbon, closeRibbon] = ribbon.create();

  updateRibbon(res("downloadingPdf"));

  let response: Response;
  try {
    response = await fetch(location.href);
  } catch (e) {
    if (location.href.startsWith("file://")) {
      updateRibbon(res("cannotFetchLocalPdf"), [""]);
    } else {
      updateRibbon((e as Error).message, [""]);
    }
    return;
  }

  if (response.status !== 200) {
    updateRibbon(await response.text(), [""]);
    return;
  }

  updateRibbon(res("preparingPdf"));

  const arrayBuffer = await response.arrayBuffer();

  if (!isPdf(arrayBuffer)) {
    updateRibbon(res("nonPdf"), [""]);
    return;
  }

  const payload = convertToBase64(arrayBuffer);
  ext().runtime.sendMessage({ type: "open_pdf", payload }).catch(console.error);

  closeRibbon();
};

const isPdf = (arrayBuffer: ArrayBuffer): boolean => {
  const first4 = new Uint8Array(arrayBuffer.slice(0, 4));
  return first4[0] === 37 && first4[1] === 80 && first4[2] === 68 && first4[3] === 70;
};

// Uint8Array.prototype.toBase64() would be simpler, but it is not available in all target browsers yet
const convertToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arrayBuffer);
  const CHUNK_SIZE = 0x8000; // Avoids exceeding the maximum number of function arguments
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
};

export default { invoke };
