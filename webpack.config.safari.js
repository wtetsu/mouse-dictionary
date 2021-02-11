const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const commonConfig = require("./webpack.config");

const specificConfig = Object.assign({}, commonConfig);

// Use chrome settings

specificConfig.output = {
  path: __dirname + "/dist-safari",
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("SAFARI"),
  })
);

specificConfig.resolve.alias = {
  ponyfill$: path.resolve(__dirname, "src/main/lib/ponyfill/chrome"),
};

specificConfig.module.rules[0].use.options.configFile = __dirname + "/.babelrc.chrome.json";

module.exports = specificConfig;
