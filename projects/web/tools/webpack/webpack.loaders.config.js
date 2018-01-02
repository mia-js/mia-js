const path = require('path');
const reStyle = /\.(css|less|scss|sss)$/;

const getLoaders = (bundle, mode) => {
    return [
        {
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: path.resolve(__dirname, '../../../../node_modules/'),
            query: {
                presets: [
                    path.resolve(__dirname, '../../../../node_modules/babel-preset-es2015'),
                    path.resolve(__dirname, '../../../../node_modules/babel-preset-react'),
                    path.resolve(__dirname, '../../../../node_modules/babel-preset-stage-2')
                ],
                plugins: []
            }
        },
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
                emitFile: bundle === 'client'
            }
        },
        {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[ext]',
                emitFile: bundle === 'client'
            }
        },
        {
            test: /\.(jpg|png|ico)$/,
            loader: 'file-loader',
            options: {
                name: 'img/[name].[ext]',
                emitFile: bundle === 'client'
            }
        }
    ]
};

module.exports = getLoaders;
