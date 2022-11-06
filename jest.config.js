module.exports = {
  testEnvironment: "jsdom",
  globals: {
    BROWSER: "chrome",
    DEBUG: true,
  },
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
