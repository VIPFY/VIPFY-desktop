module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: "node-loader"
  },
  // {
  //   test: /\.(m?js|node)$/,
  //   parser: { amd: false },
  //   use: {
  //     loader: "@marshallofsound/webpack-asset-relocator-loader",
  //     options: {
  //       outputAssetBase: "native_modules"
  //     }
  //   }
  // },

  // send everything, even dependencies, through babel.
  // this is nessesary until jscrambler supports async
  {
    test: /\.(ts|js)x?$/,
    use: [
      {
        loader: "babel-loader"
      },
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  }
];
