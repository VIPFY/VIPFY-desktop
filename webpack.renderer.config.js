const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

const fast = process.env.npm_lifecycle_event.includes("fast");

rules.push({
  test: /\.s?[ac]ss$/i,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "resolve-url-loader", options: { removeCR: true } },
    { loader: "sass-loader" }
  ]
});

rules.push({
  test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[name].[ext]",
        outputPath: "../renderer/fonts/",
        publicPath: "../fonts"
      }
    }
  ]
});

rules.push({
  test: /\.(png|jpe?g|gif)$/i,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[name].[ext]",
        outputPath: "../renderer/images/",
        publicPath: "../images"
      }
    }
  ]
});

// env vars aren't passed to here, so check npm script name instead
if (process.env.npm_lifecycle_event.includes("obfuscate")) {
  /* prettier-ignore */
  plugins.push(new CopyPlugin([{ from: "obfuscated/src/ssoConfigPreload/", to: "ssoConfigPreload/" }]));
} else {
  plugins.push(new CopyPlugin([{ from: "src/ssoConfigPreload/", to: "ssoConfigPreload/" }]));
}
//plugins.push(new BundleAnalyzerPlugin());

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  mode: fast ? "development" : "production",
  target: "electron-renderer",
  node: { global: true },
  plugins,
  optimization: {
    minimize: !fast,
    minimizer: [
      //new UglifyJsPlugin()
      new TerserPlugin({
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {},
          mangle: {}, // Note `mangle.properties` is `false` by default.
          module: false,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: true,
          keep_fnames: true,
          safari10: false
        }
      })
    ],
    splitChunks: {
      // cacheGroups: {
      //   vendor: {
      //     test: /node_modules/,
      //     chunks: "all",
      //     name: "vendor",
      //     enforce: true
      //   }
      // }
      // chunks: "all"
    }
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".node", ".json"]
  }
};
