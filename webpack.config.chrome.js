const DefinePlugin = require("webpack/lib/DefinePlugin");

const commonConfig = require("./webpack.config");
const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-chrome"
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("CHROME"),
    DIALOG_ID: JSON.stringify("____MOUSE_DICTIONARY_cf744bd007850b04601dc865815ec0f5e60c6970")
  })
);

module.exports = specificConfig;
