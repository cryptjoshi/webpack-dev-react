import React from "react";
import UniversalRouter from 'universal-router';

import { createPath } from 'history';
import App from './components/App';
import history from './core/history';
//import configureStore from './store/configureStore';
// import createApolloClient from './core/createApolloClient';
// const apolloClient = createApolloClient();

const store = {} //configureStore(window.APP_STATE, { history,apolloClient });
// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: (...styles) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => { removeCss.forEach(f => f()); };
  },
  // For react-apollo
  client: {},
  // Initialize a new Redux store
  // http://redux.js.org/docs/basics/UsageWithReact.html
  store,
};
const scrollPositionsHistory = {};
if (window.history && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
const container = document.getElementById('app');
let appInstance;
let currentLocation = history.location;
let routes = require('./routes').default;
async function onLocationChange(location,action){
  scrollPositionsHistory[currentLocation.key] = {
          scrollX: window.pageXOffset,
          scrollY: window.pageYOffset,
        };
        // Delete stored scroll position for next page if any
        if (action === 'PUSH') {
          delete scrollPositionsHistory[location.key];
        }
        currentLocation = location;
        const isInitialRender = !action;
        try {
          const router = new UniversalRouter(routes,{context})
       
          const route = await router.resolve({
            path: location.path,
            pathname: location.pathname,
          })
          if (currentLocation.key !== location.key) {
                     return;
          }

          if (route.redirect) {
                     history.replace(route.redirect);
                     return;
          }
          const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
          appInstance = renderReactApp(
                     <App locale={locale} context={context}>{route.component}</App>,
                     container,
                     () => {
                      if (isInitialRender) {
                          const elem = document.getElementById('css');
                          if (elem) elem.parentNode.removeChild(elem);
                          return;
                        }
                        document.title = route.title;
                        updateMeta('description', route.description);
                
                        let scrollX = 0;
                        let scrollY = 0;
                     })
        }
        catch(error){
            console.log(error)
            if (!isInitialRender && currentLocation.key === location.key) {
                       window.location.reload();
            }
        }
}
const main = ()=>{
history.listen(onLocationChange);
onLocationChange(currentLocation);
}
export default main
// async function onLocationChange(location, action) {
//     // Remember the latest scroll position for the previous location
//     scrollPositionsHistory[currentLocation.key] = {
//       scrollX: window.pageXOffset,
//       scrollY: window.pageYOffset,
//     };
//     // Delete stored scroll position for next page if any
//     if (action === 'PUSH') {
//       delete scrollPositionsHistory[location.key];
//     }
//     currentLocation = location;
//     const isInitialRender = !action;
  
//     try {
//       // Traverses the list of routes in the order they are defined until
//       // it finds the first route that matches provided  path string
//       // and whose action method returns anything other than `undefined`.
//       let locale = store.getState().intl.locale;
//       const route = await UniversalRouter.resolve(routes, {
//         ...context,
//         path: location.pathname,
//         query: queryString.parse(location.search),
//         locale,
//       });
  
//       // Prevent multiple page renders during the routing process
//       if (currentLocation.key !== location.key) {
//         return;
//       }
  
//       if (route.redirect) {
//         history.replace(route.redirect);
//         return;
//       }
  
//       const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
//       appInstance = renderReactApp(
//         <App locale={locale} context={context}>{route.component}</App>,
//         container,
//         () => {
//           //onRenderComplete(route, location)
//           if (isInitialRender) {
//             const elem = document.getElementById('css');
//             if (elem) elem.parentNode.removeChild(elem);
//             return;
//           }
  
//           document.title = route.title;
//           updateMeta('description', route.description);
  
//           let scrollX = 0;
//           let scrollY = 0;
//           const pos = scrollPositionsHistory[location.key];
//           if (pos) {
//             scrollX = pos.scrollX;
//             scrollY = pos.scrollY;
//           } else {
//             const targetHash = location.hash.substr(1);
//             if (targetHash) {
//               const target = document.getElementById(targetHash);
//               if (target) {
//                 scrollY = window.pageYOffset + target.getBoundingClientRect().top;
//               }
//             }
//           }
  
//           // Restore the scroll position if it was saved into the state
//           // or scroll to the given #hash anchor
//           // or scroll to top of the page
//           window.scrollTo(scrollX, scrollY);
//           // Google Analytics tracking. Don't send 'pageview' event after
//           // the initial rendering, as it was already sent
//           if (window.ga) {
//             window.ga('send', 'pageview', createPath(location));
//           }
  
//         },
//       );
//     } catch (error) {
//       // Display the error in full-screen for development mode
//       if (__DEV__) {
//         appInstance = null;
//         document.title = `Error: ${error.message}`;
//         ReactDOM.render(<ErrorReporter error={error} />, container);
//         throw error;
//       }
  
//       console.error(error); // eslint-disable-line no-console
  
//       // Do a full page reload if error occurs during client-side navigation
//       if (!isInitialRender && currentLocation.key === location.key) {
//         window.location.reload();
//       }
//     }
//   }

//   history.listen(onLocationChange);
//   onLocationChange(currentLocation);

//   if (__DEV__) {
//     window.addEventListener('error', (event) => {
//       appInstance = null;
//       document.title = `Runtime Error: ${event.error.message}`;
//       ReactDOM.render(<ErrorReporter error={event.error} />, container);
//     });
//   }
  
//   // Enable Hot Module Replacement (HMR)
//   if (module.hot) {
//     module.hot.accept('./routes', async () => {
//       routes = require('./routes').default; // eslint-disable-line global-require
  
//       currentLocation = history.location;
  
//       // if (appInstance) {
//       //   try {
//       //     // Force-update the whole tree, including components that refuse to update
//       //     deepForceUpdate(appInstance);
//       //   } catch (error) {
//       //     appInstance = null;
//       //     document.title = `Hot Update Error: ${error.message}`;
//       //     ReactDOM.render(<ErrorReporter error={error} />, container);
//       //   }
//       // }
//       if (appInstance && appInstance.updater.isMounted(appInstance)) {
//         // Force-update the whole tree, including components that refuse to update
//         deepForceUpdate(appInstance);
//       }
  
//       await onLocationChange(currentLocation);
//     });
//   }
  
// import { createRoot } from "react-dom/client";
// import App from "./components/App";

// const container = document.getElementById("root");
// const root = createRoot(container);

// root.render(<App />);