const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const commonConfig = require("./webpack.config");

const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-firefox",
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("FIREFOX"),
  })
);

specificConfig.resolve.alias = {
  ponyfill$: path.resolve(__dirname, "src/main/lib/ponyfill/firefox"),
};

specificConfig.module.rules[0].use.options.configFile = __dirname + "/.babelrc.firefox.json";

module.exports = specificConfig;
