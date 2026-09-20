/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import AceEditor from "react-ace";

type Props = {
  value: string;
  mode: string;
  theme: string;
  style: React.CSSProperties;
  onChange?: (value: string, event?: any) => void;
  warning?: string;
};

const DEFAULT_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
  marginBottom: 20,
};

const WARNING_STYLE: React.CSSProperties = {
  border: "2px solid #d9534f",
  borderRadius: "3px",
};

const WARNING_TEXT_STYLE: React.CSSProperties = {
  color: "#d9534f",
  fontWeight: "bold",
  marginTop: -16,
  marginBottom: 16,
  display: "block",
};

export const HighlightEditor: React.FC<Props> = (props) => {
  const warning = props.warning;
  const editor = (
    <AceEditor
      mode={props.mode}
      theme={props.theme}
      onChange={props.onChange}
      editorProps={{ $blockScrolling: true }}
      value={props.value}
      showPrintMargin={false}
      showGutter={false}
      highlightActiveLine={false}
      style={{ ...DEFAULT_STYLE, ...props.style, ...(warning ? WARNING_STYLE : {}) }}
      setOptions={{ useWorker: false }}
    />
  );

  if (!warning) {
    return editor;
  }
  return (
    <>
      {editor}
      <span style={WARNING_TEXT_STYLE}>{warning}</span>
    </>
  );
};
