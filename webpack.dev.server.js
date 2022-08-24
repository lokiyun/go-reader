const { resolve } = require('path')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = [
  {
    mode: 'development',
    entry: "./src/index.tsx",
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: /src/,
          resolve: {
            extensions: [".ts", ".tsx", ".js"],
          },
          use: [{ loader: "ts-loader" }],
        },
        {
          test: /\.(css|scss|sass)$/,
          exclude: /node_modules/,
          include: resolve(__dirname, "src"),
          loaders: [
            "style-loader",
            "css-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf|otf|jpg|png|webp|jpeg)$/,
          use: [
            'file-loader'
          ]
        }
      ],
    },
    output: {
      path: __dirname + "/public",
      filename: "index.js",
    },
    plugins: [
      new HardSourceWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html"
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
      hot: true,
      port: 3000,       // 指定段靠谱
      contentBase: resolve(__dirname, 'public'),
      inline: true
    }
  }
]
