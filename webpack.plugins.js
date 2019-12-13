const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
var JavaScriptObfuscator = require("webpack-obfuscator");
const webpack = require("webpack");
const JscramblerWebpack = require("jscrambler-webpack-plugin");

module.exports = [
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
