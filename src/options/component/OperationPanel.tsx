/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { Button } from "./Button";
import { res } from "../logic";

type Props = {
  disable: boolean;
  trigger: (type: "save" | "factoryReset") => void;
};

export const OperationPanel: React.FC<Props> = (props) => {
  return (
    <>
      <div style={{ position: "sticky", top: 4, zIndex: 9999, opacity: 0.95 }}>
        <Button
          type="primary"
          text={res.get("saveSettings")}
          disabled={props.disable}
          onClick={() => props.trigger("save")}
        />
      </div>
      <Button
        type="revert"
        text={res.get("defaultSettings")}
        disabled={props.disable}
        onClick={() => props.trigger("factoryReset")}
      />
    </>
  );
};
