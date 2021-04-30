/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { res } from "../../logic";
import { ExternalLink } from "../atom/ExternalLink";

type TipsProps = {
  visible: boolean;
  style: React.CSSProperties;
};

const STYLE_INNER: React.CSSProperties = {
  position: "absolute",
  right: 0,
};

const LINK_STYLE: React.CSSProperties = {
  fontSize: "small",
};

export const Tips: React.FC<TipsProps> = (props) => {
  const display = props.visible ? "block" : "none";
  return (
    <div style={{ ...props.style, display }}>
      <div style={STYLE_INNER}>
        <ExternalLink
          href="https://github.com/wtetsu/mouse-dictionary/wiki/Window-manipulation"
          icon={true}
          style={LINK_STYLE}
        >
          <img src="img/hint.png" width="16" height="16" style={{ position: "relative", top: 3, marginRight: 3 }} />
          {res.get("windowManipulation")}
        </ExternalLink>
        <br />
        <ExternalLink
          href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data"
          icon={true}
          style={LINK_STYLE}
        >
          <img src="img/hint.png" width="16" height="16" style={{ position: "relative", top: 3, marginRight: 3 }} />
          {res.get("downloadDictData")}
        </ExternalLink>
        <br />
        <ExternalLink
          href="https://github.com/wtetsu/mouse-dictionary/wiki/Keyboard-shortcuts"
          icon={true}
          style={LINK_STYLE}
        >
          <img src="img/hint.png" width="16" height="16" style={{ position: "relative", top: 3, marginRight: 3 }} />
          {res.get("setKeyboardShortcuts")}
        </ExternalLink>
      </div>
    </div>
  );
};
