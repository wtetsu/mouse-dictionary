/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Mouse Dictionary regards only these characters as target characters to look up dictionary data.
const targetCharacters = {
  // 32: true, //
  // 33: true, // !
  // 34: true, // "
  // 35: true, // #
  // 36: true, // $
  // 37: true, // %
  // 38: true, // &
  39: true, // '
  // 40: true, // (
  // 41: true, // )
  // 42: true, // *
  // 43: true, // +
  // 44: true, // ,
  45: true, // -
  // 46: true, // .
  // 47: true, // /
  48: true, // 0
  49: true, // 1
  50: true, // 2
  51: true, // 3
  52: true, // 4
  53: true, // 5
  54: true, // 6
  55: true, // 7
  56: true, // 8
  57: true, // 9
  // 58: true, // :
  // 59: true, // ;
  // 60: true, // <
  // 61: true, // =
  // 62: true, // >
  // 63: true, // ?
  // 64: true, // @
  65: true, // A
  66: true, // B
  67: true, // C
  68: true, // D
  69: true, // E
  70: true, // F
  71: true, // G
  72: true, // H
  73: true, // I
  74: true, // J
  75: true, // K
  76: true, // L
  77: true, // M
  78: true, // N
  79: true, // O
  80: true, // P
  81: true, // Q
  82: true, // R
  83: true, // S
  84: true, // T
  85: true, // U
  86: true, // V
  87: true, // W
  88: true, // X
  89: true, // Y
  90: true, // Z
  // 91: true, // [
  // 92: true, // \
  // 93: true, // ]
  //94: true, // ^
  95: true, // _
  //96: true, // `
  97: true, // a
  98: true, // b
  99: true, // c
  100: true, // d
  101: true, // e
  102: true, // f
  103: true, // g
  104: true, // h
  105: true, // i
  106: true, // j
  107: true, // k
  108: true, // l
  109: true, // m
  110: true, // n
  111: true, // o
  112: true, // p
  113: true, // q
  114: true, // r
  115: true, // s
  116: true, // t
  117: true, // u
  118: true, // v
  119: true, // w
  120: true, // x
  121: true, // y
  122: true, // z
  //123: true, // {
  //124: true, // |
  //125: true, // }
  //126: true // ~,
  8209: true // ‑
};

const quoteCharacters = {
  34: true, // "
  39: true // '
};

export default { targetCharacters, quoteCharacters };
