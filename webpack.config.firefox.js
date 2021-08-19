const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const GenerateManifestPlugin = require("./build_tools/webpack_plugins/GenerateManifestPlugin");
const commonConfig = require("./webpack.config");

const mode = process.env.NODE_ENV || "development";
const isProd = mode === "production";
const version = require("./package.json").version;

const specificConfig = Object.assign({}, commonConfig);

specificConfig.output = {
  path: __dirname + "/dist-firefox",
};

const overwrite = { version };
if (!isProd) {
  overwrite.name = "Mouse Dictionary (Debug)";
  overwrite.browser_specific_settings = {
    gecko: {
      id: "dummy@example.com",
    },
  };
}

specificConfig.plugins.push(
  new DefinePlugin({
    BROWSER: JSON.stringify("FIREFOX"),
  })
);
specificConfig.plugins.push(
  new GenerateManifestPlugin({
    from: "src/manifest-firefox.json",
    to: "manifest.json",
    overwrite,
  })
);

specificConfig.resolve.alias = {
  ponyfill$: path.resolve(__dirname, "src/main/lib/ponyfill/firefox"),
};

specificConfig.module.rules[0].use.options.configFile = __dirname + "/.babelrc.firefox.json";

module.exports = specificConfig;
