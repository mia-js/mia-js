import {createStore, applyMiddleware} from 'redux'
import {logger} from 'redux-logger'
import Reducers from '../reducers'
import Api from './../middleware/api'
import thunk from 'redux-thunk'

const configureStore = preloadedState => {
    const store = createStore(Reducers, preloadedState, applyMiddleware(Api, thunk, logger));

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers').default;
            store.replaceReducer(nextRootReducer);
        })
    }

    return store;
};

export default configureStore;
