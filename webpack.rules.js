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

  {
    test: /\.(ts|js)x?$/,
    use: [
      {
        loader: "babel-loader"
      }
      // {
      //   loader: "ts-loader",
      //   options: {
      //     transpileOnly: true
      //   }
      // }
    ]
    //include: /(node_modules)/
  }
  // {
  //   test: /\.tsx?$/,
  //   use: [
  //     //{ loader: "obfuscator-loader" },
  //     {
  //       loader: "babel-loader"
  //     }
  //     // {
  //     //   loader: "ts-loader",
  //     //   options: {
  //     //     transpileOnly: true
  //     //   }
  //     // }
  //   ],
  //   exclude: /(node_modules)/
  // }
  // {
  //   test: /\.tsx?$/,
  //   enforce: "post",
  //   use: [{ loader: "obfuscator-loader" }],
  //   exclude: /(node_modules)/
  // }
];
