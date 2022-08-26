import path from 'path';
import express from 'express';
import webpack from 'webpack';
 
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';
import UniversalRouter from 'universal-router'
import config from '../webpack.config';
import clientConfig from './client.config'
import serverConfig from './server.config'
var compression = require('compression')
import {port} from './config';
const app = express();
 
import React from 'react';
import ReactDOM from 'react-dom/server';
import { renderToStringWithData } from "@apollo/client/react/ssr";
 
import routes from './routes'
import Html from './components/Html'
import App from './components/App'

app.use(compression())
app.use(express.static(__dirname + '../build/public'));
// config.entry.push(
// 'webpack-hot-middleware/client')

const compiler = webpack([clientConfig,serverConfig]);
app.use(webpackMiddleware(compiler,{
  publicPath: config.output.publicPath,
 // writeToDisk: true,
  serverSideRender: true

}));
app.use(webpackHotMiddleware(compiler.compilers.find(compiler => compiler.name === 'client'))); 
//app.use(webpackHotServerMiddleware(compiler))
 
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

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const locale = req.language;
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
      lang={locale}
    >
      {/* {ReactDOM.renderToString(
        <IntlProvider locale={locale}>
          <ErrorPageWithoutStyle error={err} />
        </IntlProvider>,
      )} */}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});
app.listen(port, function () {
    console.log(`Listening on http://localhost:${port}`);
});