/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 *
 * Super simple, no dependency implementation of debounce.
 *
 * Based on:
 * https://github.com/lodash/lodash/blob/master/debounce.js
 * https://github.com/component/debounce/blob/master/index.js
 */

type GeneralFunction = (...args: any[]) => void;

export const debounce = (functionBody: GeneralFunction, wait: number): GeneralFunction => {
  let _timestamp: number;
  let _id: NodeJS.Timeout = null;
  let _args: any[];

  const later = () => {
    const elapsed = Date.now() - _timestamp;

    if (elapsed < wait) {
      _id = setTimeout(later, wait - elapsed);
    } else {
      _id = null;
      functionBody(..._args);
    }
  };

  const debounced = (...args: any[]) => {
    _timestamp = Date.now();
    _args = args;
    if (_id === null) {
      _id = setTimeout(later, wait);
      functionBody(...args);
    }
  };

  return debounced;
};
