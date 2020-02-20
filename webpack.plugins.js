const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const JscramblerWebpack = require("jscrambler-webpack-plugin");
const webpack = require("webpack");

const plugins = [
  // new ForkTsCheckerWebpackPlugin({
  //   async: true
  // }),
  // new JavaScriptObfuscator(
  //   {
  //     compact: false,
  //     controlFlowFlattening: false,
  //     deadCodeInjection: false,
  //     debugProtection: false,
  //     debugProtectionInterval: false,
  //     disableConsoleOutput: true,
  //     identifierNamesGenerator: "hexadecimal",
  //     log: false,
  //     renameGlobals: false,
  //     rotateStringArray: false,
  //     selfDefending: false,
  //     stringArray: false,
  //     stringArrayEncoding: false,
  //     stringArrayThreshold: 0.75,
  //     unicodeEscapeSequence: false
  //   },
  //   []
  // )
  // new JscramblerWebpack({
  //   enable: true, // optional, defaults to true
  //   params: [],
  //   applicationTypes: {}
  //   // and other jscrambler configurations
  // })
  // new webpack.BannerPlugin({
  //   banner:
  //     "hash:[hash], chunkhash:[chunkhash], name:[name], filebase:[filebase], query:[query], file:[file]"
  // })
];

// env vars aren't passed to here, so check npm script name instead
if (process.env.npm_lifecycle_event.includes("obfuscate")) {
  plugins.push(
    new JscramblerWebpack({
      enable: true, // optional, defaults to true
      applicationTypes: {
        webBrowserApp: false,
        desktopApp: true,
        serverApp: false,
        hybridMobileApp: false,
        javascriptNativeApp: false,
        html5GameApp: false
      },
      applicationId: "5de0353689a38d0016778e47"
      // and other jscrambler configurations
    })
  );
}

module.exports = plugins;
