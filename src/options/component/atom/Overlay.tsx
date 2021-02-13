/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  active: boolean;
};

export const Overlay: React.FC<Props> = (props) => {
  if (!props.active) {
    return <></>;
  }
  return (
    <div
      style={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10000,
        backgroundColor: "#ffffff",
        position: "fixed",
        opacity: 0.99,
      }}
    >
      {props.children}
    </div>
  );
};
