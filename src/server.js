import express from 'express';
import {port} from './config';
import routes from "./routes"
import compression from 'compression';
import bodyParser from 'body-parser'
import PrettyError from 'pretty-error';
import errorPageStyle from './routes/error/ErrorPage.css';
import UniversalRouter from 'universal-router'
import App from './components/App'
import Html from './components/Html';
import React from 'react';

import ReactDOM from 'react-dom/server';
import { renderToStringWithData } from "@apollo/client/react/ssr";
const app = express()
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/favicon.ico', function(req, res) { 
    res.status(204);
    res.end();    
  });
  

app.get('*', async (req, res, next) => {
    try 
    { 
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
        data.styles = [
            { id: 'css', cssText: [...css].join('') },
          ];
        //   data.scripts = [
        //     'main.js','client.js'
        //   ];
       
        data.children = await renderToStringWithData( <App context={context}>{route.component}</App>)
        const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
         //const html = "<html><head><title>Server Side Render </title></head></html>"
        res.status(route.status || 200);
        res.send(`<!doctype html>${html}`);
        }
        catch(err){
            next(err)
        }
    
})
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