/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import res from "../logic/resource";

const PersistenceSettings = (props) => {
  return (
    <div style={{ position: "sticky", top: 4, zIndex: 9999, opacity: 0.95 }}>
      <input type="button" value={res.get("saveSettings")} onClick={props.onClickSaveSettings.bind(this)} />
      <span> </span>
      <input type="button" value={res.get("defaultSettings")} onClick={props.onClickBackToDefaultSettings.bind(this)} />
    </div>
  );
};

export default PersistenceSettings;
