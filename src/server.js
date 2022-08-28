import express from 'express';
import {port} from './config';
import routes from "./routes"
import path from 'path'
import compression from 'compression';
import bodyParser from 'body-parser'
import PrettyError from 'pretty-error';
import errorPageStyle from './routes/error/ErrorPage.css';
import UniversalRouter from 'universal-router'
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
const app = express()
//app.use(compression());
app.use(express.static(__dirname + '../build/public'));
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
      // const apolloClient = createApolloClient({ ssrMode: true,
      //   link: createHttpLink({
      //     uri: 'http://localhost:3000',
      //     credentials: 'same-origin',
      //     headers: {
      //       cookie: req.header('Cookie'),
      //     },
      //   }),
      //   cache: new InMemoryCache()});
  
      const store = { user:req.user || null}
      // configureStore({
      //   user: req.user || null,
      // }, {
      //   cookie: req.headers.cookie,
      //   apolloClient,
      // });
        const css = new Set()
        // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html 
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      // Initialize a new Redux store
      // http://redux.js.org/docs/basics/UsageWithReact.html
      store,
      // Apollo Client for use with react-apollo
      client: {},
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
        data.children = await renderToStringWithData( <App context={context}>{route.component}</App>)
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
 
if (!__DEV__){
models.sync().catch(err => console.error(err.stack)).then( () => {
  //app.use(compression())
  app.use('/', expressStaticGzip(path.join(__dirname), {
    enableBrotli: true
   }));
  app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`);
  });
});
} else {
  app.use('/', expressStaticGzip(path.join(__dirname), {
    enableBrotli: true
   }));
  app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`);
  });
}
/* eslint-enable no-console */
console.log('Server')
process.on('SIGINT', function() {
  console.log('SIG-INT')
  process.exit();
});