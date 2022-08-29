import * as path from 'path'
 
import { cleanDir } from './lib/fs';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpack from 'webpack'
import cp from 'child_process';
import { port } from '../src/config'
import { ifDebug } from './lib/utils';

const clientConfig = require('./client.config')
const serverConfig = require('./server.config');
(async function start() {
   
    await cleanDir(`${path.resolve(__dirname, '../build/public')}`)

    if (ifDebug()) {
        clientConfig.entry.client = [
           // hot_client,
           'webpack-hot-middleware/client',
            ...clientConfig.entry.client
        ]
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
        )
    }
    
    const webpackBundler = webpack([clientConfig, serverConfig])
    const devMiddle = webpackDevMiddleware(webpackBundler, {
        publicPath: clientConfig.output.publicPath,
        stats:{
            colors:true
        },
        writeToDisk: true,
    })
   
     devMiddle.waitUntilValid(() => {
        //console.log('bundler complete')
        const bs = browserSync.create('BSServer');
        bs.init({
            proxy: {target:`http://localhost:${port}`,ws:true},
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: false,
              },
              logLevel: 'info',
            middleware: [
                require("compression")(),
                devMiddle,
                webpackHotMiddleware(webpackBundler.compilers[0], {log:(log)=>{console.log(log)}})]
                ,watchOptions: {
                    ignoreInitial: true
                  },
                //   files: [
                //     `${config.dist.views}**/*.{php,html,twig}`,
                //     `${config.dist.images.base}**/*.{jpg,png,gif,svg}`,
                //     `${config.dist}**/*.{css}`,
                //   ],
                 open:false,
                 callbacks: {
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

                }
            }
            })
            bs.watch(path.join(serverConfig.output.path)+ '**/*', function(event, file) {
                
                if (event === 'change') {
                  bs.reload('*.js');
                }
              });
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