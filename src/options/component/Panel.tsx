/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  active: boolean;
};

export const Panel: React.FC<Props> = (props) => {
  if (!props.active) {
    return <></>;
  }
  return <>{props.children}</>;
};
