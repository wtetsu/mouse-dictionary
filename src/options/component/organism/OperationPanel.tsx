/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useState } from "react";
import { Button } from "../atom/Button";
import { res } from "../../logic";

type Props = {
  disable: boolean;
  trigger: (type: "save" | "factoryReset") => void;
};

const style = { backgroundColor: "#FFFFFF", color: "#FF4500", transition: "0.5s" };
const style1 = { ...style, opacity: 0.0 };
const style2 = { ...style, opacity: 1.0 };

export const OperationPanel: React.FC<Props> = (props) => {
  const [mode, setMode] = useState<1 | 2>(1);

  return (
    <>
      <div style={{ position: "sticky", top: 4, zIndex: 9999, opacity: 0.95 }}>
        <Button
          type="primary"
          text={res.get("saveSettings")}
          disabled={props.disable || mode === 2}
          onClick={() => {
            props.trigger("save");
            setMode(2);
            setTimeout(() => {
              setMode(1);
            }, 2000);
          }}
        />
        <span style={mode === 1 ? style1 : style2}>{res.get("finishSaving")}</span>
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
