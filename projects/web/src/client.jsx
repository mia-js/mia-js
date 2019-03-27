import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import configureStore from './store/configureStore'

const initialState = window.__INITIAL_STATE;
let context = window.__CONTEXT;
// Enables critical path CSS rendering
// https://github.com/kriasoft/isomorphic-style-loader
context['insertCss'] = (...styles) => {
    const removeCss = styles.map(x => x._insertCss());
    return () => {
        removeCss.forEach(f => f());
    }
};
const store = configureStore(initialState);
const publicPath = initialState['App']['publicPath'];
let initialRendering = true;

const renderApp = () => {
    const App = require('./components/App').default;

    ReactDOM.hydrate(
        <Provider store={store}>
            <BrowserRouter
                basename={publicPath === '/' ? '' : publicPath.substring(1, publicPath.length - 1)}>
                <App context={context}/>
            </BrowserRouter>
        </Provider>,
        document.getElementById('app'),
        () => {
            if (initialRendering) {
                const node = document.getElementById('serverSideCSS');
                if (node) {
                    node.parentNode.removeChild(node);
                    initialRendering = false;
                }
            }
        }
    );
};
renderApp();

if (module.hot) {
    module.hot.accept('./components/App', () => {
        setTimeout(renderApp)
    });
}
