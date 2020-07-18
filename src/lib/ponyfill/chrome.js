/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const getComputedCssText = (params) => {
  const computedStyle = window.getComputedStyle(params);
  return computedStyle.cssText;
};

export default { getComputedCssText };
