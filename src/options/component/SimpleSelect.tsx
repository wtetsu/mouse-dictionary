/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  name: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (arg0: string, arg1: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SimpleSelect: React.FC<Props> = (props) => {
  const options = props.options.map((e) => (
    <option key={e.id} value={e.id}>
      {e.name}
    </option>
  ));
  return (
    <select value={props.value} onChange={(e) => props.onChange(props.name, e)}>
      {options}
    </select>
  );
};
