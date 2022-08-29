import {config,cssLoaderLegacySupportPlugins} from '../webpack.config'
import AssetsPlugin from 'assets-webpack-plugin';
import webpack from 'webpack'
const path = require("path")
const outputDir = path.resolve(__dirname, '../build/public')
const TerserPlugin = require("terser-webpack-plugin");
const isDebug = !process.argv.includes('--release');
import { RentAllAssetCopyPlugin } from './asset-copy'
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const CompressionPlugin = require('compression-webpack-plugin')
const zlib = require("zlib");
module.exports={
    name: 'client',
    mode: config.mode,
    target: 'web',
    entry: ['./src/clientLoader.js'],
    output: {
        publicPath: config.output.publicPath,
        path: outputDir,
        filename: isDebug ? '[name].js':'[chunkhash:8].js',
        chunkFilename: isDebug ? '[name].chunk.js':'[chunkhash:8].chunk.js',
    },
    resolve:{
        //extensions: ['.js','.jsx']
        fallback: {
            "crypto": false,
            "fs": false,
            // "path": require.resolve("path-browserify"),
            // "os": require.resolve("os-browserify/browser"),
            // "url": require.resolve("url"),
            // "http": require.resolve("stream-http"),
            // "https": require.resolve("https-browserify"),
            "assert": require.resolve("assert"),
        }
    },
    devtool: "eval-cheap-source-map",
    module:{
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, '../src')
                ],
                use: [
                    ...cssLoaderLegacySupportPlugins.loader,
                    {
                        loader: 'esbuild-loader',
                        options: {
                            loader: 'jsx',
                            target: 'es2015',
                        }
                    },
                ]
            },
            ...config.module.rules,
        ]
    },
    optimization: {
        minimize: isDebug? false: true,
        minimizer: [ 
            new TerserPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                },
            },
        },
    },
    plugins: [
        //...config.plugins,
        new RentAllAssetCopyPlugin(),
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            //'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            'process.env.BROWSER': true,
            __DEV__: isDebug,
          }),
        new AssetsPlugin({
            path: path.resolve(__dirname, '../build/public'),
            filename: 'assets.json',
            prettyPrint: true,
            removeFullPathAutoPrefix: true
          }),
          ...cssLoaderLegacySupportPlugins.plugins,
        //   new CompressionPlugin({
        //     filename: "[path][base].gz",
        //     algorithm: "gzip",
        //     test: /\.(js|css|html|svg)$/,
        //     compressionOptions: {
        //       params: {
        //         [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        //       },
        //     },
        //     threshold: 10240,
        //     minRatio: 0.8,
        //     deleteOriginalAssets: false,
        //   }),
        //   new BrotliPlugin({
        //     asset: '[path].br[query]',
        //     test: /\.js$|\.css$|\.html$/,
        //     threshold: 10240,
        //     minRatio: 0.8
        //     })
    ],
 
}