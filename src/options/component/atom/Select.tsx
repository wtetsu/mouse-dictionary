/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  value: string;
  options: { value: string; name: string }[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
};

export const Select: React.FC<Props> = (props) => {
  return (
    <select value={props.value} style={props.style} onChange={(e) => props.onChange(e.target.value)}>
      {props.options.map((e) => (
        <option key={e.value} value={e.value}>
          {e.name}
        </option>
      ))}
    </select>
  );
};
