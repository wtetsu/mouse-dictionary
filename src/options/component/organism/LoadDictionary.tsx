/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { useEffect, useRef, useState } from "react";
import { res } from "../../logic";
import { detectFileEncoding, type Encoding } from "../../logic/encoding";
import type { DictionaryFileEncoding, DictionaryFileFormat } from "../../types";
import { Button } from "../atom/Button";
import { Select } from "../atom/Select";

type Props = {
  defaultEncoding?: DictionaryFileEncoding;
  defaultFormat?: DictionaryFileFormat;
  busy: boolean;
  trigger: (e: TriggerEvent) => void;
};

type TriggerEvent = {
  type: "load";
  payload: {
    file: File | undefined;
    encoding: DictionaryFileEncoding;
    format: DictionaryFileFormat;
  };
};

export const LoadDictionary: React.FC<Props> = (props) => {
  const [encoding, setEncoding] = useState<DictionaryFileEncoding>("Shift_JIS");
  const [format, setFormat] = useState<DictionaryFileFormat>("EIJIRO");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [detectedEncoding, setDetectedEncoding] = useState<Encoding | undefined>(undefined);
  const selectRef = useRef<HTMLSelectElement>(null);

  const ENCODINGS = [
    { value: "Shift_JIS", name: "Shift_JIS" },
    { value: "UTF-8", name: "UTF-8" },
    { value: "UTF-16", name: "UTF-16" },
  ];

  const FORMATS = [
    { value: "EIJIRO", name: res.get("formatEijiroText") },
    { value: "TSV", name: res.get("formatTsv") },
    { value: "PDIC_LINE", name: res.get("formatPdicOneLine") },
    { value: "JSON", name: res.get("formatJson") },
  ];

  useEffect(() => {
    setDetectedEncoding(undefined);
    if (!file) {
      return;
    }
    // Ignore the result if another file was picked while detecting this one
    let stale = false;
    const load = async () => {
      const detectedEncoding = await detectFileEncoding(file);
      if (stale) {
        return;
      }
      setDetectedEncoding(detectedEncoding);
      if (detectedEncoding === "Unknown") {
        return;
      }
      const detectedEncodingName = (
        detectedEncoding === "ASCII" ? "UTF-8" : detectedEncoding
      ) as DictionaryFileEncoding;
      setEncoding(detectedEncodingName);

      if (selectRef.current) {
        selectRef.current.style.transition = "background-color 0.5s ease";
        selectRef.current.style.backgroundColor = "lightyellow";
        setTimeout(() => {
          if (selectRef.current) {
            selectRef.current.style.backgroundColor = "";
          }
        }, 1500);
      }
    };
    load();
    return () => {
      stale = true;
    };
  }, [file]);

  // ASCII is a subset of Shift_JIS, so only warn about other encodings
  const mayNotBeShiftJis =
    encoding === "Shift_JIS" && detectedEncoding !== undefined && !["Shift_JIS", "ASCII"].includes(detectedEncoding);

  return (
    <div>
      <label>{res.get("dictDataEncoding")}</label>
      <Select
        ref={selectRef}
        value={encoding}
        options={ENCODINGS}
        onChange={(value) => setEncoding(value as DictionaryFileEncoding)}
      />
      <label>{res.get("dictDataFormat")}</label>
      <Select value={format} options={FORMATS} onChange={(value) => setFormat(value as DictionaryFileFormat)} />
      <label>{res.get("readDictData")}</label>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
      <br />
      {mayNotBeShiftJis && (
        <p role="alert" style={{ margin: "0.5rem 0", color: "#d9534f", fontWeight: "bold" }}>
          <span aria-hidden="true">⚠️ </span>
          {res.get("fileMayNotBeShiftJis")}
        </p>
      )}
      <Button
        type="primary"
        text={res.get("loadSelectedFile")}
        onClick={() =>
          props.trigger({
            type: "load",
            payload: { encoding, format, file },
          })
        }
        disabled={props.busy}
      />
      <img
        src="img/loading.gif"
        width="32"
        height="32"
        style={{
          verticalAlign: "middle",
          display: props.busy ? "inline" : "none",
        }}
      />
    </div>
  );
};
