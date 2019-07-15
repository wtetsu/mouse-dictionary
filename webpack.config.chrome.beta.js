const DefinePlugin = require("webpack/lib/DefinePlugin");

const commonConfig = require("./webpack.config");
const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-chrome-beta"
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("CHROME"),
    DIALOG_ID: JSON.stringify("____MOUSE_DICTIONARY_36a6870156bfea8a9682a2ac4389776b7b3e614f")
  })
);

module.exports = specificConfig;
