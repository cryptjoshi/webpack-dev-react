import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './../webpack.config';
var compression = require('compression')

const app = express();
const compiler = webpack(config);
app.use(compression())
app.use(express.static(__dirname + '../build/public'));
app.use(webpackMiddleware(compiler,{
  publicPath: config.output.publicPath,
  writeToDisk: true,
}));
app.use(webpackHotMiddleware(compiler)); 
app.get('/favicon.ico', function(req, res) { 
  res.status(204);
  res.end();    
});
app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, '../build/public/index.html'));
});

app.listen(3000);