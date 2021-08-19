const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const GenerateManifestPlugin = require("./build_tools/webpack_plugins/GenerateManifestPlugin");
const commonConfig = require("./webpack.config");

const mode = process.env.NODE_ENV || "development";
const isProd = mode === "production";
const version = require("./package.json").version;

const specificConfig = Object.assign({}, commonConfig);

// Use chrome settings

specificConfig.output = {
  path: __dirname + "/dist-safari",
};

const overwrite = { version };
if (!isProd) {
  overwrite.name = "Mouse Dictionary (Debug)";
}

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("SAFARI"),
  })
);
specificConfig.plugins.push(
  new GenerateManifestPlugin({
    from: "src/manifest-chrome.json",
    to: "manifest.json",
    overwrite,
  })
);

specificConfig.resolve.alias = {
  ponyfill$: path.resolve(__dirname, "src/main/lib/ponyfill/chrome"),
};

specificConfig.module.rules[0].use.options.configFile = __dirname + "/.babelrc.chrome.json";

module.exports = specificConfig;
