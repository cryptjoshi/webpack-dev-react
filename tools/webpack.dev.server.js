import * as path from 'path'
 
import { cleanDir } from './lib/fs';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpack from 'webpack'
import cp from 'child_process';
var compress = require('compression');
import { port } from '../src/config'
import { ifDebug } from './lib/utils';
// const exec = util.promisify(require('child_process').exec);
import React from 'react';
const clientConfig = require('./client.config')
const serverConfig = require('./server.config');

(async function start() {
    //await exec(`rm -rf ${path.resolve(__dirname, '../build')}`)
    await cleanDir(`${path.resolve(__dirname, '../build/public')}`)

    if (ifDebug()) {
        // setting up hot reload entry and plugin to enable it
        // which already support react-hot-reload
        clientConfig.entry.client = [
            'webpack-hot-middleware/client',
           // 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
            ...clientConfig.entry.client
        ]
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
        )
    }
    
    const webpackBundler = webpack([clientConfig, serverConfig])

   
    const devMiddle = webpackDevMiddleware(webpackBundler, {
        publicPath: clientConfig.output.publicPath,
        writeToDisk: true,
    })
   
     devMiddle.waitUntilValid(() => {
        console.log('bundler complete')
        const bs = browserSync.create('BSServer');
        bs.init({
            proxy: `http://localhost:${port}`,
            middleware: [
                require("compression")(),devMiddle,webpackHotMiddleware(webpackBundler.compilers[0], {})]
            , open:false, callbacks: {
                /**
                 * This 'ready' callback can be used
                 * to access the Browsersync instance
                 */
                ready: function(err, bs) {
                    console.log(`BrowserSync up and running at http://localhost:${port}`)
                    const server = cp.spawn('node', [path.join(serverConfig.output.path, serverConfig.output.filename)], {
                        silent: false,
                        env: {
                            ...process.env,
                            NODE_ENV: 'development'
                        }
                    })
                    handleServer(server)
                    server.stderr = process.stderr
                    process.on('exit', () => {
                        server.kill('SIGTERM')
                    })
     
                   // console.log(bs.options.get('urls'));
                    // bs.addMiddleware("*", function (req, res) {
                    //     res.writeHead(302, {
                    //         location: "404.html"
                    //     });
                    //     res.end("Redirecting!");
                    // });
                }
            }
            })
                // },()=>{
        //     console.log(`BrowserSync up and running at http://localhost:${port}`)
        //     const server = cp.spawn('node', [path.join(serverConfig.output.path, serverConfig.output.filename)], {
        //         silent: false,
        //         env: {
        //             ...process.env,
        //             NODE_ENV: 'development'
        //         }
        //     })
        //     handleServer(server)
        // });
        
        // bs.init({
        //     proxy: {
        //         target: `http://localhost:${port}`,
        //         middleware: [function(req,res,next){
        //             var gzip = compress();
        //              gzip(req,res,next);
        //        },devMiddle, webpackHotMiddleware(webpackBundler.compilers[0], {})],
        //     },
        // }, () => {


        //      console.log(`BrowserSync up and running at http://localhost:${port}`)
        //      console.log('starting backend service....')
        //      //console.log(path.join(serverConfig.output.path, serverConfig.output.filename))
        //      const server = cp.spawn('node', [path.join(serverConfig.output.path, serverConfig.output.filename)], {
        //          silent: false,
        //          env: {
        //              ...process.env,
        //              NODE_ENV: 'development'
        //          }
        //      })

        //     handleServer(server)
        //     server.stderr = process.stderr
        //     process.on('exit', () => {
        //         server.kill('SIGTERM')
        //     })
        //  })



        //  bs.watch(path.join(serverConfig.output.path, serverConfig.output.filename,"*.js"), function (event, file) {
        //     console.log(event,file)
        //     if (event === "change") {
        //         bs.reload("*.js");
        //     }
        // });
      


     })
})()

function handleServer(server) {
    server.once('exit', (code) => {
        throw new Error(`server terminated unexpectedly with code ${code}`)
    })
    server.stdout.on('data', (data) => {
        process.stdout.write(data);
    })
    server.stderr.on('data', (data) => {
        process.stdout.write(data);
    })
}