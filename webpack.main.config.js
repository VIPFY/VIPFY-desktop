module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: ["./node_modules/regenerator-runtime/runtime.js", "./src/index.ts"],
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules")
  },
  devServer: {
    hot: true
  },
  plugins: require("./webpack.plugins"),
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".node", ".json"]
  }
};
