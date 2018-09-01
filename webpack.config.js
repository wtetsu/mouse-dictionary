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
  devtool:
    process.env.NODE_ENV === "production" ? false : "cheap-module-source-map"
};
