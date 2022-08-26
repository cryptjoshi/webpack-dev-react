const Dotenv = require("dotenv-webpack")
const webpack = require("webpack")
const path = require("path")
const CompressionPlugin = require('compression-webpack-plugin')
const zlib = require("zlib");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const isDebug = true
module.exports = {
  name: "config",
  mode: 'development',
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, use: 'babel-loader'},
      {
        test: /\.css/,
        exclude: [path.resolve(__dirname, "../node_modules")],
        use: [
          {
            loader: "isomorphic-style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: false,
              modules: true,
              esModule: false,
              modules: {
                localIdentName: isDebug?
                  "[name]-[local]-[hash:base64:5]":
                  "[hash:base64:5]"
                ,
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "./tools/postcss.config.js"),
              },
            },
          },
        ],
      },
    ]   
  },
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, './src/server.js')
  ],
  output: {
    path: path.resolve(__dirname, './build/public'),
    publicPath: '/',
    filename: "bundle.[contenthash].js",
    clean: true,
  },
  plugins: [
    new Dotenv(),
    new webpack.HotModuleReplacementPlugin(),
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
    // new HtmlWebpackPlugin({
    //   template: "public/index.html",
    // }),
  ],
  devtool: 'eval-source-map',
  // externals: {
  //        "express": "require('express')"
  // }
}
