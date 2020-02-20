const path = require("path");

const fast = process.env.npm_lifecycle_event.includes("fast");

const rules = [
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
    use: fast
      ? [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              onlyCompileBundledFiles: true
            }
          }
        ]
      : [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true
            }
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              onlyCompileBundledFiles: true
            }
          }
        ],
    include: path.resolve(__dirname, "src")
  }
];

if (!fast) {
  rules.push({
    test: /\.(ts|js)x?$/,
    use: [
      {
        loader: "babel-loader",
        options: {
          cacheDirectory: true
        }
      }
    ],
    exclude: path.resolve(__dirname, "src")
  });
}

module.exports = rules;
