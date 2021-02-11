const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const commonConfig = require("./webpack.config");

const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-chrome",
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("CHROME"),
  })
);

specificConfig.resolve.alias = {
  ponyfill$: path.resolve(__dirname, "src/main/lib/ponyfill/chrome"),
};

specificConfig.module.rules[0].use.options.configFile = __dirname + "/.babelrc.chrome.json";

module.exports = specificConfig;
