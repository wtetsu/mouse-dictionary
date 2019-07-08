/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import "@babel/polyfill";
import swal from "sweetalert";
import React from "react";
import { render } from "react-dom";
import Main from "./components/Main";
import rule from "../main/rule";

window.onerror = msg => {
  swal({
    text: msg,
    icon: "error"
  });
};

render(<Main />, document.getElementById("app"));

// Lazy load
rule.load();
