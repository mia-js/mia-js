const path = require('path');
const reStyle = /\.(css|less|scss|sss)$/;
const publicPath = require('./publicPath');

const getLoaders = (bundle, mode) => {

    let babelLoader = {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, '../../../../node_modules/'),
        query: {
            presets: [
                // Configure babel-preset-env for server bundle
                [path.resolve(__dirname, '../../../../node_modules/@babel/preset-env'), {
                    targets: {node: true}
                }],
                path.resolve(__dirname, '../../../../node_modules/babel-preset-react')
            ],
            plugins: [
                path.resolve(__dirname, '../../../../node_modules/babel-plugin-transform-class-properties'),
                path.resolve(__dirname, '../../../../node_modules/babel-plugin-transform-object-rest-spread'),
            ]
        }
    };

    if (bundle === 'client') {
        // Configure babel-preset-env for client bundle
        babelLoader['query']['presets'][0][1] = {targets: {browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR']}};
    }

    return [
        babelLoader,
        // Rules for Style Sheets
        {
            test: reStyle,
            rules: [
                // Convert CSS into JS module
                {
                    issuer: {not: [reStyle]},
                    use: 'isomorphic-style-loader',
                },

                // Process external/third-party styles
                {
                    exclude: path.resolve(__dirname, '../../src/components'),
                    loader: 'css-loader',
                    options: {
                        sourceMap: (mode === 'watch'),
                        localIdentName: '[local]'
                    },
                },

                // Process internal/project styles (from src folder)
                {
                    include: path.resolve(__dirname, '../../src/components'),
                    loader: 'css-loader',
                    options: {
                        // CSS Loader https://github.com/webpack/css-loader
                        importLoaders: 2,
                        sourceMap: (mode === 'watch'),
                        // CSS Modules https://github.com/css-modules/css-modules
                        modules: true,
                        localIdentName: '[name]-[local]-[hash:base64:5]'
                    },
                },

                // Apply PostCSS plugins
                {
                    loader: 'postcss-loader',
                    options: {
                        config: {
                            path: path.resolve(__dirname, '../postcss.config.js'),
                        },
                    },
                },

                // Compile Less to CSS
                // https://github.com/webpack-contrib/less-loader
                {
                    test: /\.less$/,
                    loader: 'less-loader'
                }
            ]
        },
        {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                mimetype: 'application/font-woff',
                name: 'fonts/[name].[ext]',
                publicPath: !_.isEmpty(publicPath) ? publicPath : '/',
                emitFile: bundle === 'client'
            }
        },
        {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[ext]',
                publicPath: !_.isEmpty(publicPath) ? publicPath : '/',
                emitFile: bundle === 'client'
            }
        },
        {
            test: /\.(jpg|png|ico)$/,
            loader: 'file-loader',
            options: {
                name: 'img/[name].[ext]',
                publicPath: !_.isEmpty(publicPath) ? publicPath : '/',
                emitFile: bundle === 'client'
            }
        }
    ]
};

module.exports = getLoaders;
