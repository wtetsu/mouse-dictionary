/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import swal from "sweetalert";
import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Main } from "./page/Main";
import rule from "../main/core/rule";
import { res } from "./logic";
import { storage } from "./extern";

import ace from "ace-builds/src-noconflict/ace";
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

const PDF_KEY = "**** pdf ****";

const App = () => {
  const [mode, setMode] = useState<"loading" | "options" | "pdf">("loading");

  const showPdfViewer = async () => {
    setMode("pdf");
    storage.local.set({ [PDF_KEY]: "" });
    location.href = "pdf/web/viewer.html";
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      const data = await storage.local.pick(PDF_KEY);
      if (data) {
        showPdfViewer();
      } else {
        setMode("options");
      }
    };
    init();

    setInterval(async () => {
      const data = await storage.local.pick(PDF_KEY);
      if (data) {
        showPdfViewer();
      }
    }, 3000);
  }, []);

  switch (mode) {
    case "loading":
      return <div></div>;
    case "options":
      return <Main />;
    case "pdf":
      return <div></div>;
  }
};

render(<App />, document.getElementById("app"));

// Lazy load
rule.load();
