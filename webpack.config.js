const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LodashWebpackPlugin = require("lodash-webpack-plugin");
const UniteJsonPlugin = require("./webpack_plugins/UniteJsonPlugin");
const jaRule = require("deinja/src/data");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    "options/options": "./src/options/main.jsx",
    main: "./src/main/main.js"
  },
  output: {
    path: __dirname + "/dist"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader"
        },
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        use: [
          {
            loader: "babel-loader",
            options: { presets: ["@babel/env", "@babel/react"] }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "static", to: "." },
      { from: "static_overwrite", to: "." },
      { from: __dirname + "/node_modules/milligram/dist/milligram.min.css", to: "options/" }
    ]),
    new UniteJsonPlugin([
      {
        from: [
          { name: "noun", file: "rule/noun.json" },
          { name: "phrase", file: "rule/phrase.json" },
          { name: "pronoun", file: "rule/pronoun.json" },
          { name: "spelling", file: "rule/spelling.json" },
          { name: "trailing", file: "rule/trailing.json" },
          { name: "verb", file: "rule/verb.json" },
          { name: "ja", data: jaRule }
        ],
        to: "data/rule.json"
      }
    ]),
    new LodashWebpackPlugin()
  ],
  devtool: isProd ? false : "cheap-module-inline-source-map",
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 3000000
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: true,
          warnings: false
        }
      })
    ]
  }
};
