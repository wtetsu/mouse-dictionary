/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import immer from "immer";
import { Button } from "../atom/Button";
import { res } from "../../logic";
import { Replace } from "../../types";

type Props = {
  replaceRules: Replace[];
  onUpdate: (e: Replace[]) => void;
};

type Action =
  | {
      type: "add";
    }
  | {
      type: "change";
      payload: {
        index: number;
        target: "search" | "replace";
        value: string;
      };
    }
  | {
      type: "move";
      payload: {
        index1: number;
        index2: number;
      };
    }
  | {
      type: "delete";
      payload: {
        index: number;
      };
    };

const reduce = (state: Replace[], action: Action): Replace[] => {
  switch (action.type) {
    case "add":
      return immer(state, (d) => {
        const newKey = new Date().getTime().toString();
        d.push({ key: newKey, search: "", replace: "" });
      });
    case "change":
      return immer(state, (d) => {
        const p = action.payload;
        d[p.index][p.target] = p.value;
      });
    case "move":
      return immer(state, (d) => {
        const { index1, index2 } = action.payload;
        const isValidIndex = (index1 >= 0 && index1 < d.length) || (index2 >= 0 && index2 < d.length);
        if (!isValidIndex) {
          return;
        }
        const [orgKey1, orgKey2] = [d[index1].key, d[index2].key];
        [d[index1], d[index2]] = [d[index2], d[index1]];
        [d[index1].key, d[index2].key] = [orgKey1, orgKey2];
      });

    case "delete":
      return immer(state, (d) => {
        d.splice(action.payload.index, 1);
      });
  }
};

export const ReplaceRuleEditor: React.FC<Props> = (props) => {
  const update = (action: Action) => {
    const newRules = reduce(props.replaceRules, action);
    props.onUpdate(newRules);
  };

  return (
    <>
      {props.replaceRules.map((r, i) => (
        <div key={r.key ?? r.search}>
          <button
            type="button"
            className="button button-outline button-arrow"
            onClick={() => update({ type: "move", payload: { index1: i, index2: i - 1 } })}
            disabled={i === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className="button button-outline button-arrow"
            onClick={() => update({ type: "move", payload: { index1: i, index2: i + 1 } })}
            disabled={i === props.replaceRules.length - 1}
          >
            ↓
          </button>
          <input
            type="text"
            name={`replaceRule.search.${i}`}
            key={`replaceRule.search.${i}`}
            value={r.search}
            style={{ width: 230 }}
            onChange={(e) =>
              update({
                type: "change",
                payload: { index: i, target: "search", value: e.target.value },
              })
            }
          />
          <span>{res.get("replaceRule1")}</span>
          <input
            type="text"
            name={`replaceRule.replace.${i}`}
            key={`replaceRule.replace.${i}`}
            value={r.replace}
            style={{ width: 370 }}
            onChange={(e) =>
              update({
                type: "change",
                payload: { index: i, target: "replace", value: e.target.value },
              })
            }
          />
          <span>{res.get("replaceRule2")}</span>

          <button
            type="button"
            className="button button-arrow"
            onClick={() => update({ type: "delete", payload: { index: i } })}
            style={{ marginLeft: 3 }}
          >
            ×
          </button>
        </div>
      ))}
      <Button type="primary" text={res.get("add")} onClick={() => update({ type: "add" })} />
    </>
  );
};
