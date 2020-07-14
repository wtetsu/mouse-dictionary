/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import * as res from "../logic/resource";
import { Replace } from "../types";

type Props = {
  replaceRules: Replace[];
  changeReplaceRule: (e: ReplaceRuleChangeEvent) => void;
};

export type ReplaceRuleChangeEvent =
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
        index: number;
        offset: number;
      };
    }
  | {
      type: "delete";
      payload: {
        index: number;
      };
    };

export const ReplaceRule: React.FC<Props> = (props) => {
  const replaceRules = props.replaceRules ?? [];

  return (
    <>
      {replaceRules.map((r, i) => (
        <div key={r.key ?? r.search}>
          <button
            type="button"
            className="button button-outline button-arrow"
            onClick={() => props.changeReplaceRule({ type: "move", payload: { index: i, offset: -1 } })}
            disabled={i === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className="button button-outline button-arrow"
            onClick={() => props.changeReplaceRule({ type: "move", payload: { index: i, offset: +1 } })}
            disabled={i === replaceRules.length - 1}
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
              props.changeReplaceRule({
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
              props.changeReplaceRule({
                type: "change",
                payload: { index: i, target: "replace", value: e.target.value },
              })
            }
          />
          <span>{res.get("replaceRule2")}</span>

          <button
            type="button"
            className="button button-arrow"
            onClick={() => props.changeReplaceRule({ type: "delete", payload: { index: i } })}
            style={{ marginLeft: 3 }}
          >
            ×
          </button>
        </div>
      ))}
    </>
  );
};
