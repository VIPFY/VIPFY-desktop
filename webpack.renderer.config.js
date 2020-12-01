const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const fast = process.env.npm_lifecycle_event.includes("fast");

rules.push({
  test: /\.s?[ac]ss$/i,
  use: [
    { loader: fast ? "style-loader" : MiniCssExtractPlugin.loader },
    { loader: "css-loader" },
    { loader: "resolve-url-loader", options: { removeCR: true, debug: true } },
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
    },
    {
      loader: "image-webpack-loader",
      options: { disable: fast }
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
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: false, // deactivate the default functionality,
        "third-party": {
          test: /[\\\/]node_modules[\\\/]((?!react).*)[\\\/]/,
          chunks: "all",
          name: "vendors", // This avoids that ~main-window gets appended
          priority: 10
        },
        components: {
          test: /[\\\/]src[\\\/]react[\\\/]components[\\\/]/,
          chunks: "all",
          reuseExistingChunk: true,
          name: "components",
          enforce: true,
          priority: 6
        },
        react: {
          test: /[\\\/]node_modules[\\\/](react).*[\\\/]/,
          name: "react-code",
          chunks: "all",
          enforce: true,
          priority: 15
        },
        commons: {
          chunks: "all",
          minChunks: 2, // At least two Components should include the file
          name: "common",
          reuseExistingChunk: true,
          enforce: true, // Min size to include this chunk would be 30kb otherwise,
          priority: 5
        }
      }
    }
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".node", ".json"]
  }
};
