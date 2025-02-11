/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { forwardRef } from "react";

type SelectProps = {
  value: string;
  options: { value: string; name: string }[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ value, options, onChange, style }, ref) => (
  <select ref={ref} value={value} style={style} onChange={(e) => onChange(e.target.value)}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.name}
      </option>
    ))}
  </select>
));
