/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useRef, useState, MutableRefObject } from "react";
import { Button } from "../atom/Button";
import { Select } from "../atom/Select";
import { res } from "../../logic";
import { DictionaryFileEncoding, DictionaryFileFormat } from "../../types";

type Props = {
  defaultEncoding?: DictionaryFileEncoding;
  defaultFormat?: DictionaryFileFormat;
  busy: boolean;
  trigger: (e: TriggerEvent) => void;
};

type TriggerEvent =
  | {
      type: "load";
      payload: {
        file: File;
        encoding: DictionaryFileEncoding;
        format: DictionaryFileFormat;
      };
    }
  | { type: "clear" };

export const LoadDictionary: React.FC<Props> = (props) => {
  const [encoding, setEncoding] = useState(props.defaultEncoding);
  const [format, setFormat] = useState(props.defaultFormat);

  const fileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const ENCODINGS = [
    { value: "Shift-JIS", name: "Shift-JIS" },
    { value: "UTF-8", name: "UTF-8" },
    { value: "UTF-16", name: "UTF-16" },
  ];

  const FORMATS = [
    { value: "EIJIRO", name: res.get("formatEijiroText") },
    { value: "TSV", name: res.get("formatTsv") },
    { value: "PDIC_LINE", name: res.get("formatPdicOneLine") },
    { value: "JSON", name: res.get("formatJson") },
  ];

  return (
    <div>
      <label>{res.get("dictDataEncoding")}</label>
      <Select value={encoding} options={ENCODINGS} onChange={(value) => setEncoding(value as DictionaryFileEncoding)} />
      <label>{res.get("dictDataFormat")}</label>
      <Select value={format} options={FORMATS} onChange={(value) => setFormat(value as DictionaryFileFormat)} />
      <label>{res.get("readDictData")}</label>
      <input type="file" ref={fileInput} />
      <br />
      <Button
        type="primary"
        text={res.get("loadSelectedFile")}
        onClick={() => props.trigger({ type: "load", payload: { encoding, format, file: fileInput.current.files[0] } })}
        disabled={props.busy}
      />
      <img
        src="img/loading.gif"
        width="32"
        height="32"
        style={{ verticalAlign: "middle", display: props.busy ? "inline" : "none" }}
      />
    </div>
  );
};

LoadDictionary.defaultProps = {
  defaultEncoding: "Shift-JIS",
  defaultFormat: "EIJIRO",
};
