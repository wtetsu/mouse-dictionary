/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  active: boolean;
  children?: React.ReactNode;
};

export const Panel: React.FC<Props> = (props) => {
  if (!props.active) {
    return <></>;
  }
  return <>{props.children}</>;
};
