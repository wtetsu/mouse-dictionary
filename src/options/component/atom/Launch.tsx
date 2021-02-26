/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useState } from "react";

type Props = {
  text: string;
  href: string;
  image: string;
  style?: React.CSSProperties;
};

const STYLE_OUTER: React.CSSProperties = {
  width: 180,
};

const STYLE_IMAGE: React.CSSProperties = {
  verticalAlign: "middle",
};

const STYLE1: React.CSSProperties = {
  backgroundColor: "#ffffff",
  boxShadow: "2px 2px 2px 2px #b0b0b0",
  borderRadius: 10,
  paddingLeft: 6,
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  width: 180,
  textAlign: "center",
  verticalAlign: "middle",
};

const STYLE2: React.CSSProperties = {
  ...STYLE1,
  backgroundColor: "#fff4ff",
};

export const Launch: React.FC<Props> = (props) => {
  const [hover, setHover] = useState(false);

  const enter = () => {
    setHover(true);
  };
  const leave = () => {
    setHover(false);
  };

  return (
    <div onMouseEnter={enter} onMouseLeave={leave} style={{ ...STYLE_OUTER, ...props.style }}>
      <a href={props.href} target="_blank" rel="noopener noreferrer">
        <div style={hover ? STYLE2 : STYLE1}>
          <img src={props.image} style={STYLE_IMAGE} />
          <span>{props.text}</span>
        </div>
      </a>
    </div>
  );
};
