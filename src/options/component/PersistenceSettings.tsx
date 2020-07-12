/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import * as res from "../logic/resource";

type Props = {
  trigger: (type: "save" | "factoryReset") => void;
};

export const PersistenceSettings: React.FC<Props> = (props) => {
  return (
    <div style={{ position: "sticky", top: 4, zIndex: 9999, opacity: 0.95 }}>
      <input type="button" value={res.get("saveSettings")} onClick={() => props.trigger("save")} />
      <span> </span>
      <input type="button" value={res.get("defaultSettings")} onClick={() => props.trigger("factoryReset")} />
    </div>
  );
};
