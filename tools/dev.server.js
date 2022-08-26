import path from 'path';
import express from 'express';
import webpack from 'webpack';
 
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import UniversalRouter from 'universal-router'
import config from './../webpack.config';
var compression = require('compression')
import {port} from '../src/config';
const app = express();

import React from 'react';
import ReactDOM from 'react-dom/server';
import { renderToStringWithData } from "@apollo/client/react/ssr";
 
import routes from '../src/routes'
import Html from './../src/components/Html'
import App from './../src/components/App'

app.use(compression())
app.use(express.static(__dirname + '../build/public'));
// config.entry.push(
// 'webpack-hot-middleware/client')

const compiler = webpack(config);
app.use(webpackMiddleware(compiler,{
  publicPath: config.output.publicPath,
  writeToDisk: true,
}));
app.use(webpackHotMiddleware(compiler)); 
app.get('/favicon.ico', function(req, res) { 
  res.status(204);
  res.end();    
});


app.get('*', async (req, res, next) => {
  try {
  const store = {}
  const css = new Set()
  const context = { 
    insertCss: (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    },
    store,
    // Apollo Client for use with react-apollo
    client: {},
  }

  const router = new UniversalRouter(routes,{context})
 
  const route = await router.resolve({
    path: req.path,
    pathname: req.path,
  })
  const data = { ...route}
 
  data.children = await renderToStringWithData( <App context={context}>{route.component}</App>)
  const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
   //const html = "<html><head><title>Server Side Render </title></head></html>"
  res.status(route.status || 200);
  res.send(`<!doctype html>${html}`);
  }
  catch(err){
      next(err)
  }
  // res.sendFile(path.join(__dirname, '../build/public/index.html'));
  // const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
  //   res.status(route.status || 200);
  //   res.send(`<!doctype html>${html}`);
});

app.listen(port,()=>{
  console.log(`Server running on http://localhost:${port}`)
})