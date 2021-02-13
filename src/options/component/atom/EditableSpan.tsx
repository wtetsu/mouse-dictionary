/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useState } from "react";

type Props = {
  value: string;
  style: React.CSSProperties;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const EditableSpan: React.FC<Props> = (props) => {
  const [editable, setEditable] = useState(props.value === "");

  if (!editable) {
    return (
      <span style={{ ...props.style, cursor: "pointer" }} onClick={() => setEditable(true)}>
        {props.value}
      </span>
    );
  }

  return (
    <input
      value={props.value}
      style={{ ...props.style }}
      autoFocus={true}
      onChange={(e) => props.onChange(e)}
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          setEditable(false);
        }
      }}
    ></input>
  );
};
