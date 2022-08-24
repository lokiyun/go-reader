const { resolve } = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")

module.exports = [
    {
        mode: "production",
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
        mode: "production",
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
    {
        mode: "production",
        entry: "./src/index.tsx",
        target: "web",
        devtool: "source-map",
        performance: {
            hints: false,
        },
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
            path: __dirname + "/dist",
            filename: "index.js",
        },
        plugins: [
            new HardSourceWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
            })
        ],
    },
]
