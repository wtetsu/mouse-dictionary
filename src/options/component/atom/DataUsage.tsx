/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useEffect } from "react";
import { res } from "../../logic";
import { storage, config } from "../../extern";

type Props = {
  byteSize: number;
  onUpdate: (byteSize: number) => void;
};

export const DataUsage: React.FC<Props> = (props) => {
  useEffect(() => {
    const updateSize = async () => {
      if (props.byteSize === null) {
        const newSize = (await config.getBytesInUse()) ?? -1;
        props.onUpdate(newSize);
      }
      if (props.byteSize === -1) {
        const pSize = storage.local.getBytesInUse();
        // Waits at least 500 ms in order to show off doing something :-)
        await Promise.all([pSize, wait(500)]);
        const newSize = (await pSize) ?? 0;
        config.setBytesInUse(newSize);
        props.onUpdate(newSize);
      }
    };
    updateSize();
  }, [props.byteSize]);

  if (props.byteSize === null || props.byteSize === -1) {
    return (
      <div style={{ height: 24 }}>
        <img src="img/loading.gif" width="16" height="16" style={{ verticalAlign: "middle" }} />
      </div>
    );
  }

  const sizeString = Math.floor(props.byteSize / 1024).toLocaleString();
  const sizeInfo = res.get("dictDataUsage", { size: sizeString });
  return (
    <div style={{ fontSize: "75%", cursor: "pointer", height: 24 }} onClick={() => props.onUpdate(-1)}>
      {sizeInfo}
    </div>
  );
};

const wait = (time: number): Promise<void> =>
  new Promise((done) => {
    setTimeout(() => {
      done();
    }, time);
  });
