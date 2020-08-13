/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import res from "./resource";
import ribbon from "../lib/ribbon";

const invoke = async () => {
  const [updateRibbon, closeRibbon] = ribbon.create();

  updateRibbon(res("downloadingPdf"));

  let response;
  try {
    response = await fetch(location.href);
  } catch (e) {
    updateRibbon(e.message, [""]);
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
  sendMessage({ type: "open_pdf", payload });

  closeRibbon();
};

const isPdf = (arrayBuffer) => {
  const first4 = new Uint8Array(arrayBuffer.slice(0, 4));
  return first4[0] === 37 && first4[1] === 80 && first4[2] === 68 && first4[3] === 70;
};

const convertToBase64 = (arrayBuffer) => {
  let result = "";
  const byteArray = new Uint8Array(arrayBuffer);

  for (let i = 0; ; i++) {
    if (i * 1023 >= byteArray.length) {
      break;
    }
    const start = i * 1023;
    const end = (i + 1) * 1023;

    const slice = byteArray.slice(start, end);
    const base64slice = btoa(String.fromCharCode(...slice));

    result += base64slice;
  }
  return result;
};

const sendMessage = async (message) => {
  return new Promise((done) => {
    chrome.runtime.sendMessage(message, (response) => {
      done(response);
    });
  });
};

export default { invoke };
