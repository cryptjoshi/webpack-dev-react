import { configStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

export default function configureStore(state,config){
const {apolloClient} = config
const middleware = [
    //thunk.withExtraArgument(helpers),
    apolloClient.
  ];
  
  let enhancer;

  if (__DEV__) {
    //middleware.push(createLogger());

    // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
    let devToolsExtension = f => f;
    if (process.env.BROWSER && window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }

    enhancer = compose(
      applyMiddleware(...middleware),
      devToolsExtension,
    );
  } else {
    enhancer = applyMiddleware(...middleware);
  }

  const store = configStore(state,enhancer)
  return store
} 