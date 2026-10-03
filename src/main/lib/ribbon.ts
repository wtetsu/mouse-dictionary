/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "./dom";

const INDICATORS = ["⠿", "⠿", "⠿", "⠷", "⠯", "⠟", "⠻", "⠽", "⠾"];

const DEFAULT_STYLE =
  "position:absolute;width:100%;bottom:0;background-color:black;opacity:0.90;text-align:center;font-size:x-large;color:#FFFFFF";

type UpdateRibbon = (text: string, newIndicators?: string[]) => void;
type CloseRibbon = () => void;

const create = (style = ""): [UpdateRibbon, CloseRibbon] => {
  const line = dom.create(`<div style="${DEFAULT_STYLE};${style}"></div>`);

  const progress = dom.create('<span style=""></span>');
  const indicator = dom.create('<span style="position:absolute;text-align:center;"></span>');

  let indicators = [...INDICATORS];

  let indicatorCount = 0;
  const intervalId = setInterval(() => {
    indicator.textContent = indicators[indicatorCount % indicators.length];
    indicatorCount++;
  }, 150);

  line.appendChild(progress);
  line.appendChild(indicator);
  document.body.appendChild(line);

  const doUpdate: UpdateRibbon = (text, newIndicators) => {
    progress.textContent = text;
    if (newIndicators) {
      indicators = newIndicators;
    }
  };
  const doClose = () => {
    line.remove();
    clearInterval(intervalId);
  };
  return [doUpdate, doClose];
};

export default { create };
