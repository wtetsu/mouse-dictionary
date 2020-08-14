/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const LETTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ch = () => {
  const index = Math.floor(Math.random() * LETTERS.length);
  return LETTERS[index];
};

const generateUniqueId = (digits) => {
  let uniqueId = "";
  for (let i = 0; i < digits; i++) {
    uniqueId += ch();
  }
  return uniqueId;
};

export default generateUniqueId;
