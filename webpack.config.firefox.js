const DefinePlugin = require("webpack/lib/DefinePlugin");

const exp = require("./webpack.config");

exp.output = {
  path: __dirname + "/dist-firefox"
};

exp.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("FIREFOX")
  })
);

module.exports = exp;
