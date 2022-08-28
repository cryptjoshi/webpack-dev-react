const Dotenv = require("dotenv-webpack")
const webpack = require("webpack")

const path = require("path")

const HtmlWebpackPlugin = require("html-webpack-plugin");
 
var StringReplacePlugin = require("string-replace-webpack-plugin");
const isVerbose = process.argv.includes('--verbose');
const isDebug = !process.argv.includes('--release');
const cssLoaderLegacySupportPlugins = {
  plugins: [
      new StringReplacePlugin(),
  ],
  loader: [
      {
          loader: StringReplacePlugin.replace({
              replacements: [
                  {
                      pattern: /css-loader\!/g,
                      replacement: function (match, p1, offset, string) {
                          return 'css-loader?esModule=false!';
                      }
                  }
              ]
          })
      },
  ],
}
const config = {
  name: "config",
  context: path.resolve(__dirname),
  mode: isDebug?'development': 'production',
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
      {
        test: /\.md$/,
        loader: path.resolve(__dirname, './lib/markdown-loader.js'),
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file-loader',
          options: {
              name: isDebug?'[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
          }
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ]   
  },
  output: {
    path: path.resolve(__dirname, '../build/public'),
    publicPath: '/public/',
    pathinfo: isVerbose,
  },
  plugins: [
    // new Dotenv(),
    new webpack.HotModuleReplacementPlugin(),
  

  ],
  devtool: 'eval-source-map',

}
module.exports={config,cssLoaderLegacySupportPlugins}