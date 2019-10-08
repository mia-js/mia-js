import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import App from './components/App'
import routes from '../routes'
import RoutesHandler from '../../generic/libs/routesHandler/v1/routesHandler'

const publicPath = RoutesHandler.getPublicPath(routes);
let context = {};
// Enables critical path CSS rendering
// https://github.com/kriasoft/isomorphic-style-loader
context['insertCss'] = (...styles) => {
    const removeCss = styles.map(x => x._insertCss());
    return () => {
        removeCss.forEach(f => f());
    }
};
let initialRendering = true;

ReactDOM.hydrate(
    <BrowserRouter
        basename={publicPath === '/' ? '' : publicPath.substring(1, publicPath.length - 1)}>
        <App context={context}/>
    </BrowserRouter>,
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
