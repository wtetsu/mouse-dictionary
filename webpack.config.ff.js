const CopyWebpackPlugin = require("copy-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");

const exp = require("./webpack.config");

exp.output = {
  path: __dirname + "/dist-ff"
};

exp.plugins = [
  new CopyWebpackPlugin([{ from: "static", to: "." }, { from: __dirname + "/node_modules/milligram/dist/milligram.min.css", to: "options/" }]),
  new DefinePlugin({
    BROWSER: JSON.stringify("FIREFOX")
  })
];

module.exports = exp;
