import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {Helmet} from 'react-helmet'
import {StaticRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import configureStore from './store/configureStore'
import App from './components/App'
import {matchRoutes} from 'react-router-config'
import routes from './routes/routes'

function Server() {
    let self = this;

    self.render = (location, env, publicPath, initialState) => {
        const css = new Set(); // CSS for all rendered React components
        const context = {
            // Enables critical path CSS rendering
            // https://github.com/kriasoft/isomorphic-style-loader
            insertCss: (...styles) => styles.forEach(style => css.add(style._getCss()))
        };

        initialState['App'] = initialState['App'] || {};
        initialState['App']['env'] = env;
        initialState['App']['publicPath'] = publicPath;
        initialState['App']['config'] = require(`./config/${env.identity}.js`);

        const store = configureStore(initialState);

        /**
         * Prefetch data and render afterwards
         *
         * Therefore use static route file to get component tree.
         */
        const componentTree = matchRoutes(routes, location.replace(publicPath.substring(0, publicPath.length - 1), '')); // Remove basename
        const promises = componentTree.map(({route, match}) => {
            let fetchData = route.component.fetchData;
            return fetchData instanceof Function ? fetchData(store, match) : Promise.resolve(null)
        });

        return Promise.all(promises)
            .then(data => {
                try {
                    const app = ReactDOMServer.renderToString(
                        <Provider store={store}>
                            <StaticRouter
                                basename={publicPath.substring(1, publicPath.length - 1)}
                                location={location}
                                context={context}>
                                <App context={context}/>
                            </StaticRouter>
                        </Provider>
                    );

                    const helmet = Helmet.renderStatic();
                    const htmlAttrs = helmet.htmlAttributes.toString();
                    const bodyAttrs = helmet.bodyAttributes.toString();

                    if (context.url) {
                        return Promise.reject({
                            error: 'RedirectException',
                            message: '',
                            context
                        });
                    }

                    return '<!DOCTYPE html>' +
                        `<html ${htmlAttrs}>` +
                        '<head>' +
                        `${helmet.title.toString()}` +
                        `${helmet.meta.toString()}` +
                        `${helmet.link.toString()}` +
                        `${helmet.script.toString()}` +
                        `<style type="text/css" id="serverSideCSS">${[...css].join('')}</style>` +
                        '<script type="text/javascript">' +
                        `window.__CONTEXT = ${JSON.stringify(context)};` +
                        `window.__INITIAL_STATE = ${JSON.stringify(store.getState())};` +
                        '</script>' +
                        '</head>' +
                        `<body ${bodyAttrs}>` +
                        `<div id="app">${app}</div>` +
                        `<script type="text/javascript" src="${publicPath + 'scripts/bundle.js'}" async></script>` +
                        '</body>' +
                        '</html>';
                } catch (e) {
                    return Promise.reject({
                        error: e
                    });
                }
            });
    };

    return self;
}

module.exports = new Server();
