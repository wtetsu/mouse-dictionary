const DefinePlugin = require("webpack/lib/DefinePlugin");

const commonConfig = require("./webpack.config");
const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-firefox"
};

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("FIREFOX")
  })
);

module.exports = specificConfig;
