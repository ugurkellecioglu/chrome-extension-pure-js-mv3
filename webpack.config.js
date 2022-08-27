var webpack = require("webpack"),
  path = require("path"),
  env = require("./scripts/env"),
  { CleanWebpackPlugin } = require("clean-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  WriteFilePlugin = require("write-file-webpack-plugin")

var fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
]
var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    popup: path.join(__dirname, "src", "popup.js"),
    background: path.join(__dirname, "src", "background.js"),
    content: path.join(__dirname, "src", "content.js"),
  },
  output: {
    globalObject: "this",
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].bundle.js",
    assetModuleFilename: "images/[name][ext]",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(s?css|sass)$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".jsx", ".js", ".sass"]),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "dist"),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify(
                {
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString()),
                },
                null,
                "\t"
              )
            )
          },
        },
        // {
        //   from: "src/background.js",
        //   to: path.join(__dirname, "dist"),
        // },
        // {
        //   from: "src/pages",
        //   to: path.join(__dirname, "dist", "pages"),
        // },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new WriteFilePlugin(),
  ],
  optimization: {
    minimize: false,
  },
}

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map"
}

module.exports = options
