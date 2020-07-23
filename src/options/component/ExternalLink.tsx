/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

type Props = {
  href: string;
};

export const ExternalLink: React.FC<Props> = (props) => {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "underline", fontSize: "small" }}
    >
      {props.children}
    </a>
  );
};
