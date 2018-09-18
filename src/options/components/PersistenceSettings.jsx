/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

const PersistenceSettings = props => {
  return (
    <div>
      <input type="button" value="保存する" onClick={props.onClickSaveSettings.bind(this)} />
      <span> </span>
      <input type="button" value="初期状態に戻す" onClick={props.onClickBackToDefaultSettings.bind(this)} />
    </div>
  );
};

export default PersistenceSettings;
