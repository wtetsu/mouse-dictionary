/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { MouseEventHandler } from "react";

type Props = {
  switch: boolean;
  image: string;
  text1: string;
  text2: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
};

const style = { verticalAlign: "bottom", marginRight: 2, transition: "0.5s" };
const style1 = { ...style, transform: "rotateZ(0deg)" };
const style2 = { ...style, transform: "rotateZ(-250deg)" };

export const Toggle: React.FC<Props> = (props) => {
  return (
    <div style={{ marginTop: 30, marginBottom: 30 }}>
      <a style={{ cursor: "pointer", userSelect: "none" }} onClick={(e) => props.onClick(e)}>
        <img src={props.image} style={props.switch ? style2 : style1} />
        {props.switch ? props.text2 : props.text1}
      </a>
    </div>
  );
};
