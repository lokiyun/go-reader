const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

module.exports = [
  {
    mode: "development",
    entry: "./src/electron.ts",
    target: "electron-main",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          resolve: {
            extensions: [".ts", ".js"],
          },
          use: [{ loader: "ts-loader" }],
        }
      ],
    },
    output: {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
      path: __dirname + "/dist",
      filename: "electron.js",
    },
    node: {
      __dirname: false,
    },
    plugins: [new HardSourceWebpackPlugin()],
  },
  {
    mode: "development",
    entry: "./src/preload.ts",
    target: "electron-preload",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          resolve: {
            extensions: [".ts", ".js"],
          },
          use: [{ loader: "ts-loader" }],
        },

      ],
    },
    output: {
      path: __dirname + "/dist",
      filename: "preload.js",
    },
    plugins: [new HardSourceWebpackPlugin()],
  },
]
