/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import storage from "./storage";

const KEY_LAST_POSITION = "**** last_position ****";

const fetchInitialPosition = async options => {
  let result;
  switch (options.type) {
    case "right":
      {
        const left = options.documentWidth - options.dialogWidth - 5;
        result = { left: `${left}px` };
      }
      break;
    case "left":
      {
        const left = 5;
        result = { left: `${left}px` };
      }
      break;
    case "keep":
      {
        const data = await storage.sync.get(KEY_LAST_POSITION);
        const lastPositionJson = data[KEY_LAST_POSITION];
        const lastPosition = lastPositionJson ? JSON.parse(lastPositionJson) : {};
        const pos = optimizeInitialPosition(lastPosition, options);

        const styles = {};
        if (Number.isFinite(pos.left)) {
          styles.left = `${pos.left}px`;
        }
        if (Number.isFinite(pos.top)) {
          styles.top = `${pos.top}px`;
        }
        if (Number.isFinite(pos.width)) {
          styles.width = `${pos.width}px`;
        }
        if (Number.isFinite(pos.height)) {
          styles.height = `${pos.height}px`;
        }
        result = styles;
      }
      break;
    default:
      result = {};
  }
  return result;
};

const optimizeInitialPosition = (position, options) => {
  let newLeft;
  if (position.left < 0) {
    newLeft = 5;
  } else if (position.left + position.width > options.windowWidth) {
    newLeft = options.windowWidth - position.width - 5;
  } else {
    newLeft = position.left;
  }

  let newTop;
  if (position.top < 0) {
    newTop = 5;
  } else if (position.top + position.height > options.windowHeight) {
    newTop = options.windowHeight - position.height - 5;
  } else {
    newTop = position.top;
  }

  const newPosition = {
    left: newLeft,
    top: newTop,
    width: max(position.width, 50),
    height: max(position.height, 50)
  };
  return newPosition;
};

const max = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.max(a, b);
  } else {
    return null;
  }
};

export default {
  fetchInitialPosition: fetchInitialPosition,
  save(e) {
    const positionData = {};
    positionData[KEY_LAST_POSITION] = JSON.stringify(e);
    return storage.sync.set(positionData);
  }
};
