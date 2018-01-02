const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const routes = require('../routes/index');

const projectName = path.resolve(__dirname, '../').split(path.sep).pop();
const bundleName = projectName + 'ServerBundle';

// Hide deprecation warnings from loader-utils
process.noDeprecation = true;

const getConfig = mode => {
    const webpackLoaders = require('./webpack/webpack.loaders.config')('server', mode);

    let config = {
        name: bundleName,
        entry: path.resolve(__dirname, '../src/server.jsx'),
        output: {
            libraryTarget: 'commonjs',
            // Output server package directly in controllers folder
            path: path.resolve(__dirname, '../controllers'),
            // Get public path from projects routes config
            publicPath: routes.prefix + '/',
            filename: 'server.dist.js'
        },
        devtool: mode === 'watch' ? 'eval-source-map' : 'eval',
        target: 'node',
        externals: [
            nodeExternals({
                modulesDir: path.resolve(__dirname, '../../../node_modules/'),
                whitelist: [
                    'bootstrap/dist/css/bootstrap.css',
                    'font-awesome/css/font-awesome.css'
                ]
            })
        ],
        module: {
            loaders: webpackLoaders
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                // Hot reloading with isomorphic-style-loader
                debug: true
            })
        ]
    };

    if (mode === 'fs') {
        config['plugins'] = [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            })
        ]
    }

    return config;
};

module.exports = getConfig;
