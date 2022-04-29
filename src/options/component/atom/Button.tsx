/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { MouseEventHandler } from "react";

type Props = {
  text: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  type: "primary" | "cancel" | "revert" | "json";
  disabled?: boolean;
};

const CLASS = {
  primary: "",
  cancel: "button-outline button-black",
  revert: "button-outline button-small",
  json: "button-black",
};

export const Button: React.FC<Props> = (props) => {
  return (
    <button
      type="button"
      className={CLASS[props.type]}
      style={{ marginRight: 5, cursor: "pointer" }}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};
