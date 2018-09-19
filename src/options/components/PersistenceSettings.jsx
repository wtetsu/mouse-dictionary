/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import res from "../resources";

const PersistenceSettings = props => {
  return (
    <div>
      <input type="button" value={res("saveSettings")} onClick={props.onClickSaveSettings.bind(this)} />
      <span> </span>
      <input type="button" value={res("defaultSettings")} onClick={props.onClickBackToDefaultSettings.bind(this)} />
    </div>
  );
};

export default PersistenceSettings;
