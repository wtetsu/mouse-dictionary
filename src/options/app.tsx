/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ace from "ace-builds/src-noconflict/ace";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import swal from "sweetalert";
import { ext, rule } from "./extern";
import { res } from "./logic";
import { Main } from "./page/Main";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-solarized_light";

ace.config.set("basePath", "/options");

res.setLang(res.decideInitialLanguage([...navigator.languages]));

window.onerror = (msg) => {
  swal({
    text: msg.toString(),
    icon: "error",
  });
};

const App = () => {
  const [mode, setMode] = useState<"loading" | "options" | "pdf">("loading");

  const showPdfViewer = (id: string) => {
    setMode("pdf");
    location.href = `pdf/web/viewer.html?id=${id}`;
  };

  useEffect(() => {
    const shiftPdfId = (): Promise<string | undefined> => ext().runtime.sendMessage({ type: "shift_pdf_id" });

    const init = async (): Promise<void> => {
      const id = await shiftPdfId();
      if (id) {
        showPdfViewer(id);
      } else {
        setMode("options");
      }
    };
    init();

    // Must not return a Promise: Firefox would treat it as this page responding to the message
    ext().runtime.onMessage.addListener((request) => {
      switch (request?.type) {
        case "prepare_pdf": {
          shiftPdfId().then((id) => {
            if (id) {
              showPdfViewer(id);
            }
          });
          break;
        }
      }
    });
  }, []);

  switch (mode) {
    case "loading":
      return <div />;
    case "options":
      return <Main />;
    case "pdf":
      return <div />;
  }
};

const root = createRoot(document.getElementById("app") as HTMLElement);

root.render(<App />);

// Lazy load
rule.load();
