/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import * as res from "../logic/resource";

type Props = {
  byteSize?: number;
};

export const DataUsage: React.FC<Props> = (props) => {
  if (props.byteSize === null) {
    return <img src="loading.gif" width="32" height="32" style={{ verticalAlign: "middle" }} />;
  }
  const sizeString = Math.floor(props.byteSize / 1024).toLocaleString();
  const sizeInfo = res.get("dictDataUsage", sizeString);
  return <div>{sizeInfo}</div>;
};
