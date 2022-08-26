import config from '../webpack.config'
module.exports={
    name: 'client',
    mode: config.mode,
    target: 'web',
    entry: ['./src/client.js'],
    output: {
        ...config.output,
        filename: 'client.js'
    },
    resolve:{
        extensions: ['.js','.jsx']
    },
    devtool: 'source-map',
    module:{
        rules: [
            ...config.module.rules,
        ]
    },
    plugins: [
        ...config.plugins
    ]
}