/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { res } from "../../logic";
import { ExternalLink } from "../atom/ExternalLink";
import { Links } from "../../resource/links";

type TipsProps = {
  style: React.CSSProperties;
};

const INNER_STYLE: React.CSSProperties = {
  position: "absolute",
  right: 0,
  listStyle: "none",
};

const LI_STYLE: React.CSSProperties = {
  marginBottom: 0,
};

const LINK_STYLE: React.CSSProperties = {
  fontSize: "small",
};

export const Tips: React.FC<TipsProps> = (props) => {
  const tips = [
    { text: res.get("windowManipulation"), href: Links.windowManipulation },
    { text: res.get("downloadDictData"), href: Links.downloadDictData },
    { text: res.get("setKeyboardShortcuts"), href: Links.setKeyboardShortcuts },
  ];

  return (
    <div style={{ ...props.style }}>
      <ul style={INNER_STYLE}>
        {tips.map((e, i) => (
          <li style={LI_STYLE} key={i}>
            <ExternalLink href={e.href} icon={true} style={LINK_STYLE}>
              <img src="img/hint.png" width="16" height="16" style={{ position: "relative", top: 3, marginRight: 3 }} />
              {e.text}
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
