/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { useEffect, useState } from "react";
import { res } from "../../logic";
import type { DictionaryPack } from "../../types";
import { Button } from "../atom/Button";

type Props = {
  busy: boolean;
  packs: DictionaryPack[];
  selectedPackIds: string[];
  onSync: (packIds: string[]) => void;
};

export const DictionaryPacks: React.FC<Props> = (props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(props.selectedPackIds));

  useEffect(() => {
    setSelected(new Set(props.selectedPackIds));
  }, [props.selectedPackIds]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const dirty = selected.size !== props.selectedPackIds.length || props.selectedPackIds.some((id) => !selected.has(id));

  return (
    <div style={{ marginTop: 10 }}>
      <div>
        {props.packs.map((pack) => (
          <label key={pack.id} style={{ marginRight: 16, cursor: "pointer", fontSize: "90%" }}>
            <input
              type="checkbox"
              checked={selected.has(pack.id)}
              disabled={props.busy}
              onChange={() => toggle(pack.id)}
            />{" "}
            {pack.label ?? pack.id}
          </label>
        ))}
      </div>
      <Button
        type="primary"
        text={res.get("applyDictionaryPacks")}
        disabled={props.busy || !dirty || props.packs.length === 0}
        onClick={() => props.onSync(Array.from(selected))}
      />
    </div>
  );
};
