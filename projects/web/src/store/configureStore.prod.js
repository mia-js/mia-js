import {createStore, applyMiddleware} from 'redux'
import Reducers from '../reducers'
import Api from './../middleware/api'
import thunk from 'redux-thunk'

const configureStore = preloadedState => {
    return createStore(Reducers, preloadedState, applyMiddleware(Api, thunk));
};

export default configureStore;
