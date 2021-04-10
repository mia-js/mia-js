import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import App from './components/App'
import routes from '../routes'
import RoutesHandler from '../../generic/libs/routesHandler/v1/routesHandler'

const publicPath = RoutesHandler.getPublicPath(routes);

export default locals => {
    const css = new Set(); // CSS for all rendered React components
    const context = {
        // Enables critical path CSS rendering
        // https://github.com/kriasoft/isomorphic-style-loader
        insertCss: (...styles) => styles.forEach(style => css.add(style._getCss()))
    };
    const app = ReactDOMServer.renderToString(
        <StaticRouter
            basename={publicPath === '/' ? '' : publicPath.substring(1, publicPath.length - 1)}
            location={locals.path}
            context={context}>
            <App context={context}/>
        </StaticRouter>
    );

    return '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        `<style type="text/css" id="serverSideCSS">${[...css].join('')}</style>` +
        '</head>' +
        '<body>' +
        `<div id="app">${app}</div>` +
        `<script type="text/javascript" src="${__WEBPACK_OUTPUT_PATH__}app-${__VERSION_HASH__}.dist.js" async></script>` +
        '</body>' +
        '</html>';
}
