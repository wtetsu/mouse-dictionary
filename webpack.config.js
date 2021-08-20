const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const UniteJsonPlugin = require("./build_tools/webpack_plugins/UniteJsonPlugin");
const GenerateDictionaryPlugin = require("./build_tools/webpack_plugins/GenerateDictionaryPlugin");
const GenerateManifestPlugin = require("./build_tools/webpack_plugins/GenerateManifestPlugin");
const jaRule = require("deinja/src/data");

const mode = process.env.NODE_ENV || "development";
const isProd = mode === "production";

const version = require("./package.json").version;

const copyWebpackPluginConfigs = {
  patterns: [
    { from: "static", to: "." },
    { from: __dirname + "/node_modules/milligram/dist/milligram.min.css", to: "options/" },
    { from: __dirname + "/node_modules/ace-builds/src-min-noconflict/worker-html.js", to: "options/" },
    { from: __dirname + "/node_modules/ace-builds/src-min-noconflict/worker-json.js", to: "options/" },
    { from: "static_pdf/options", to: "options/" },
  ],
};

if (!isProd) {
  copyWebpackPluginConfigs.patterns.push({ from: "static_overwrite", to: "." });
}

const overwrite = { version };
if (!isProd) {
  overwrite.name = "Mouse Dictionary (Debug)";
  overwrite.browser_specific_settings = {
    gecko: {
      id: "dummy@example.com",
    },
  };
}

module.exports = (env) => {
  if (!env.platform) {
    throw Error("env.platform is empty");
  }
  return {
    mode: mode,
    entry: {
      "options/options": "./src/options/app.tsx",
      main: "./src/main/start.js",
      background: "./src/background/background.js",
    },
    output: {
      path: __dirname + `/dist-${env.platform}`,
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: !isProd,
              configFile: __dirname + `/platform/.babelrc.${env.platform}.json`,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
      alias: { ponyfill$: path.resolve(__dirname, `src/main/lib/ponyfill/chrome`) },
    },
    devtool: isProd ? false : "inline-cheap-module-source-map",
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 3000000,
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              pure_funcs: ["console.info", "console.warn", "console.time", "console.timeEnd"],
            },
          },
        }),
      ],
    },
    plugins: [
      new DefinePlugin({
        DIALOG_ID: JSON.stringify(`____MOUSE_DICTIONARY_6FQSXRIXUKBSIBEF_${version}`),
      }),
      new DefinePlugin({
        BROWSER: JSON.stringify(env.platform.toUpperCase()),
      }),
      new CopyPlugin(copyWebpackPluginConfigs),
      new UniteJsonPlugin([
        {
          from: [
            { name: "letters", file: "data/rule/letters.json5" },
            { name: "noun", file: "data/rule/noun.json5" },
            { name: "phrase", file: "data/rule/phrase.json5" },
            { name: "pronoun", file: "data/rule/pronoun.json5" },
            { name: "spelling", file: "data/rule/spelling.json5" },
            { name: "trailing", file: "data/rule/trailing.json5" },
            { name: "verb", file: "data/rule/verb.json5" },
            { name: "ja", data: jaRule },
          ],
          to: "data/rule.json",
        },
      ]),
      new GenerateDictionaryPlugin({
        from: ["data/dict/[a-z].json5"],
        to: "data/dict",
        split: 10,
      }),
      new GenerateManifestPlugin({
        from: `platform/manifest-${env.platform}.json`,
        to: "manifest.json",
        overwrite,
      }),
    ],
  };
};
