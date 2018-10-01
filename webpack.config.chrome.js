const DefinePlugin = require("webpack/lib/DefinePlugin");

const exp = require("./webpack.config");

exp.output = {
  path: __dirname + "/dist-chrome"
};

exp.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("CHROME")
  })
);

module.exports = exp;
