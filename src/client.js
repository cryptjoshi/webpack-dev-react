import React from "react";
import UniversalRouter from 'universal-router';
import ReactDOM  from "react-dom";
import { createPath } from 'history';
import { createRoot } from "react-dom/client"
import App from './components/App';
import history from './core/history';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { updateMeta } from './core/DOMUtils';
//import configureStore from './store/configureStore';
// import createApolloClient from './core/createApolloClient';
// const apolloClient = createApolloClient();

const store = {} //configureStore(window.APP_STATE, { history,apolloClient });
// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const css = new Set()
const insertCss = (...styles) => {
  // eslint-disable-next-line no-underscore-dangle
  const removeCss = styles.map(x => x._insertCss());
  return () => { removeCss.forEach(f => f()); };
}
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
const container = document.getElementById('root');
let appInstance;
let currentLocation = history.location;

let locale = "en" //store.getState().intl.locale;
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

         

          const isInitialRender = false
                     const callback = () => {
                      if (isInitialRender) {
                          const elem = document.getElementById('css');
                          if (elem) elem.parentNode.removeChild(elem);
                          return;
                        }
                        document.title = route.title;
                        updateMeta('description', route.description);
                
                        let scrollX = 0;
                        let scrollY = 0;

                        const pos = scrollPositionsHistory[location.key];
                        if (pos) {
                          scrollX = pos.scrollX;
                          scrollY = pos.scrollY;
                        } else {
                          const targetHash = location.hash.substr(1);
                          if (targetHash) {
                            const target = document.getElementById(targetHash);
                            if (target) {
                              scrollY = window.pageYOffset + target.getBoundingClientRect().top;
                            }
                          }
                        }
            // Restore the scroll position if it was saved into the state
            // or scroll to the given #hash anchor
            // or scroll to top of the page
              window.scrollTo(scrollX, scrollY);
              // Google Analytics tracking. Don't send 'pageview' event after
            // the initial rendering, as it was already sent
            if (window.ga) {
              window.ga('send', 'pageview', createPath(location));
            }
                
                     }
          appInstance = createRoot(container)
          .render(
            <StyleContext.Provider value={{ insertCss }}>
  
           <App locale={locale} context={context} callback={()=>console.log("Rendering....")}>{route.component}</App>
   
           </StyleContext.Provider>
           )
           requestIdleCallback(callback)
        }
        catch(error){
          if (__DEV__) {
            appInstance = null;
            document.title = `Error: ${error.message}`;
            createRoot(container).render(<ErrorReporter error={error} />);
            throw error;
          }
            console.log(error)
            if (!isInitialRender && currentLocation.key === location.key) {
                       window.location.reload();
            }
        }
}

const main = ()=>{
      history.listen(onLocationChange);
      onLocationChange(currentLocation);
      if (__DEV__) {
        window.addEventListener('error', (event) => {
          appInstance = null;
          document.title = `Runtime Error: ${event.error.message}`;
          createRoot(container).render(<ErrorReporter error={event.error} />);
        });
      }

      if (module.hot) {
        module.hot.accept('./routes', async () => {
          routes = require('./routes').default; // eslint-disable-line global-require
      
          currentLocation = history.location;
          
          // if (appInstance) {
          //   try {
          //     // Force-update the whole tree, including components that refuse to update
          //     deepForceUpdate(appInstance);
          //   } catch (error) {
          //     appInstance = null;
          //     document.title = `Hot Update Error: ${error.message}`;
          //     ReactDOM.render(<ErrorReporter error={error} />, container);
          //   }
          // }
          if (appInstance && appInstance.updater.isMounted(appInstance)) {
            // Force-update the whole tree, including components that refuse to update
            deepForceUpdate(appInstance);
          }
      
          await onLocationChange(currentLocation);
        });
      }
}

export default main
 