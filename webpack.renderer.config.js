const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.s[ac]ss$/i,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "resolve-url-loader" },
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

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  target: "electron-renderer",
  node: { global: true },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss"]
  }
};
