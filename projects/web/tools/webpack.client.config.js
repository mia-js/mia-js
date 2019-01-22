const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const publicPath = require('./webpack/publicPath');

const projectName = path.resolve(__dirname, '../').split(path.sep).pop();
const bundleName = projectName + 'ClientBundle';

// Hide deprecation warnings from loader-utils
process.noDeprecation = true;

const getConfig = mode => {
    const webpackLoaders = require('./webpack/webpack.loaders.config')('client', mode);

    let config = {
        mode: mode === 'watch' ? 'development' : 'production',
        name: bundleName,
        entry: [
            path.resolve(__dirname, './../../../node_modules/@babel/polyfill'),
            `webpack-hot-middleware/client?path=${publicPath}__webpack_hmr&name=${bundleName}`,
            path.resolve(__dirname, '../src/client.jsx')
        ],
        output: {
            // Output dist files directly in projects public folder
            path: path.resolve(__dirname, '../public/'),
            publicPath: publicPath,
            filename: 'scripts/bundle.js'
        },
        devtool: mode === 'watch' ? 'eval-source-map' : 'eval',
        module: {
            rules: webpackLoaders
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        ]
    };

    if (mode === 'fs') {
        config['entry'] = [
            path.resolve(__dirname, '../../../node_modules/@babel/polyfill'),
            path.resolve(__dirname, '../src/client.jsx')
        ];
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
