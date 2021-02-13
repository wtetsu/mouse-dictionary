/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";

type Props = {
  value: string;
  mode: string;
  theme: string;
  style: React.CSSProperties;
  onChange?: (value: string, event?: any) => void;
};

const DEFAULT_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
  marginBottom: 20,
};

export const HighlightEditor: React.FC<Props> = (props) => {
  return (
    <AceEditor
      mode={props.mode}
      theme={props.theme}
      onChange={props.onChange}
      editorProps={{ $blockScrolling: true }}
      value={props.value}
      showPrintMargin={false}
      showGutter={false}
      highlightActiveLine={false}
      style={{ ...DEFAULT_STYLE, ...props.style }}
    />
  );
};
