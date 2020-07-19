/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useState } from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const EditableSpan: React.FC<Props> = (props) => {
  const [editable, setEditable] = useState(false);

  if (!editable) {
    return (
      <span style={{ cursor: "pointer" }} onClick={() => setEditable(true)}>
        {props.value}
      </span>
    );
  }

  return <input value={props.value} onChange={(e) => props.onChange(e)}></input>;
};
