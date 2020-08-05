/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import swal from "sweetalert";
import React from "react";
import { render } from "react-dom";
import { Main } from "./page/Main";
import rule from "../main/core/rule";
import { res } from "./logic";

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

render(<Main />, document.getElementById("app"));

// Lazy load
rule.load();
