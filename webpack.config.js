const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LodashWebpackPlugin = require("lodash-webpack-plugin");
const UniteJsonPlugin = require("./webpack_plugins/UniteJsonPlugin");
const jaRule = require("deinja/src/data");

const isProd = process.env.NODE_ENV === "production";

const copyWebpackPluginConfigs = [
  { from: "static", to: "." },
  { from: __dirname + "/node_modules/milligram/dist/milligram.min.css", to: "options/" }
];

if (!isProd) {
  copyWebpackPluginConfigs.push({ from: "static_overwrite", to: "." });
}

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
    new CopyWebpackPlugin(copyWebpackPluginConfigs),
    new UniteJsonPlugin([
      {
        from: [
          { name: "letters", file: "rule/letters.json5" },
          { name: "noun", file: "rule/noun.json5" },
          { name: "phrase", file: "rule/phrase.json5" },
          { name: "pronoun", file: "rule/pronoun.json5" },
          { name: "spelling", file: "rule/spelling.json5" },
          { name: "trailing", file: "rule/trailing.json5" },
          { name: "verb", file: "rule/verb.json5" },
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
