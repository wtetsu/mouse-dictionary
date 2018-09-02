//const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    "options/options": "./src/options.js",
    background: "./src/background.js",
    content: "./src/content.js"
  },
  output: {
    path: __dirname + "/dist"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  optimization:
    process.env.NODE_ENV === "production"
      ? {
          minimizer: [
            new UglifyJsPlugin({
              uglifyOptions: {
                compress: true,
                ecma: 6,
                mangle: true
              },
              sourceMap: false
            })
          ]
        }
      : {},
  devtool: process.env.NODE_ENV === "production" ? false : "cheap-module-source-map"
};
