/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

const SimpleSelect = (props) => {
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

export default SimpleSelect;
