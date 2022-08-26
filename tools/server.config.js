import config from '../webpack.config'
module.exports={
    name: 'server',
    mode: config.mode,
    target: 'node',
    externals: {
        "express": "require('express')"
        // 'sharp', 'bcrypt', 'sequelize',
        // /^\.\/assets\.json$/,
        // ({ context, request }, callback) => {
        //     const isExternal =
        //         request.match(/^[@a-z][a-z/.\-0-9]*$/i) &&
        //         !request.match(/\.(css|less|scss|sss)$/i);
        //     callback(null, Boolean(isExternal));
        // },
  
    },
    // externals: {
    //     "express": "require('express')",
    //     /^\.\/assets\.json$/,
    //     ({ context, request }, callback) => {
    //         const isExternal =
    //             request.match(/^[@a-z][a-z/.\-0-9]*$/i) &&
    //             !request.match(/\.(css|less|scss|sss)$/i);
    //         callback(null, Boolean(isExternal));
    //     },
    // },
    entry: ['./src/server.js'],
    output: {
        ...config.output,
        filename: 'server-ssr.js'
    },
    resolve:{
        extensions: ['.js','.jsx'],
    
    },
    devtool: 'source-map',
    module:{
        rules: [
            ...config.module.rules,
          
        ]
    },
    plugins: [
        ...config.plugins,
        // new ExtractTextPlugin({
        //     filename: 'styles.css',
        //     allChunks: true
        // }),
    ],
   
}