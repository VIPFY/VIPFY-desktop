const JscramblerWebpack = require("jscrambler-webpack-plugin");
const webpack = require("webpack");
const { UnusedFilesWebpackPlugin } = require("unused-files-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const fast = process.env.npm_lifecycle_event.includes("fast");

const plugins = [
  new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
  new UnusedFilesWebpackPlugin(),
  new MiniCssExtractPlugin(),
  new HTMLWebpackPlugin({
    template: "./src/index.html",
    minify: {
      removeAttributeQuotes: !fast,
      collapseWhitespace: !fast,
      removeComments: !fast
    }
  })
  // new webpack.BannerPlugin({
  //   banner:
  //     "hash:[hash], chunkhash:[chunkhash], name:[name], filebase:[filebase], query:[query], file:[file]"
  // })
];

// env vars aren't passed to here, so check npm script name instead
if (process.env.npm_lifecycle_event.includes("obfuscate")) {
  /* prettier-ignore */
  plugins.push(new CopyPlugin([{ from: "obfuscated/src/ssoConfigPreload/", to: "ssoConfigPreload/" }]));
} else {
  plugins.push(new CopyPlugin([{ from: "src/ssoConfigPreload/", to: "ssoConfigPreload/" }]));
}

// env vars aren't passed to here, so check npm script name instead
if (process.env.npm_lifecycle_event.includes("obfuscate")) {
  plugins.push(new BundleAnalyzerPlugin());
  plugins.push(new JscramblerWebpack({ chunks: ["main_window", "components", "common"] }));
}

module.exports = plugins;
