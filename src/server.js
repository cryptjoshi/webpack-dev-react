import express from 'express';
import {port,locales} from './config';
import routes from "./routes"
import path from 'path'
import compression from 'compression';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser'
import PrettyError from 'pretty-error';
import errorPageStyle from './routes/error/ErrorPage.css';
import UniversalRouter from 'universal-router'
import fetch from 'cross-fetch';
import App from './components/App'
import Html from './components/Html';
import React from 'react';
import models from './data/models';
import schema from './data/schema';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import ReactDOM from 'react-dom/server';
import { renderToStringWithData } from "@apollo/client/react/ssr";
var expressStaticGzip = require('express-static-gzip');
var { graphqlHTTP } = require('express-graphql');
import StyleContext from 'isomorphic-style-loader/StyleContext'

 
import { ApolloClient, HttpLink,InMemoryCache } from '@apollo/client';
import configureStore from '../src/store/configStore'

const app = express()
//app.use(compression());

global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';



 
app.use(express.static(__dirname + '../build/public'));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/.well-known', express.static(path.join(__dirname, '../well-known')));
app.use(cookieParser());
app.use(requestLanguage({
  languages: locales,
  queryName: 'lang',
  cookie: {
    name: 'lang',
    options: {
      path: '/',
      maxAge: 3650 * 24 * 3600 * 1000, // 10 years in miliseconds
    },
    url: '/lang/{language}',
  },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (__DEV__) {
  app.enable('trust proxy');
}

app.get('/favicon.ico', function(req, res) { 
    res.status(204);
    res.end();    
  });

  var root = {
    hello: () => {
      return 'Hello world!';
    },
  }
 
  
app.use('/graphql', graphqlHTTP(async (req,res,graphQLParams)=> ({
  schema: schema,
  rootValue: {
    request: req,
    response: res
  },
  graphiql: true,
}))
)

 app.get('*', async (req, res, next) => {
     try 
     { 
 
      const apolloClient = new ApolloClient({
        link: new HttpLink({ uri: '/graphql', fetch }),
        cache: new InMemoryCache(),
      
      });
  
    const store =  configureStore({user:req.user || null},{cookie:req.headers.cookie,apolloClient})
      // configureStore({
      //   user: req.user || null,
      // }, {
      //   cookie: req.headers.cookie,
      //   apolloClient,
      // });
    const css = new Set()
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    }
        // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html 
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: insertCss,
      // Initialize a new Redux store
      // http://redux.js.org/docs/basics/UsageWithReact.html
      store,
      // Apollo Client for use with react-apollo
      client: apolloClient,
    };
      
        const router = new UniversalRouter(routes,{context})
       
        const route = await router.resolve({
          path: req.path,
          pathname: req.path,
        })
        const data = { ...route}
        data.styles = [
            { id: 'css', cssText: [...css].join('') },
          ];
           data.scripts = [
         assets.vendor.js
           ];
           if (route.chunks) {
            data.scripts.push(...route.chunks.map(chunk => assets[chunk].js));
          }
        data.scripts.push(assets.main.js);
        data.children = await renderToStringWithData(
          <StyleContext.Provider value={{ insertCss }}>
        <App context={context}>{route.component}</App>
       </StyleContext.Provider>
        )
        const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
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
//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
 
//if (!__DEV__){
models.sync().catch(err => console.error(err.stack)).then( () => {
  //app.use(compression())
  console.log('Graphql loading.... \n')
  app.use('/', expressStaticGzip(path.join(__dirname), {
    enableBrotli: true
   }));
  app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`);
  });
});
// } else {
//   app.use('/', expressStaticGzip(path.join(__dirname), {
//     enableBrotli: true
//    }));
//   app.listen(port, () => {
//     console.log(`The server is running at http://localhost:${port}/`);
//   });
// }
/* eslint-enable no-console */
console.log('Serve Side Rendering.... \n')
process.on('SIGINT', function() {
  console.log('SIG-INT')
  process.exit();
});