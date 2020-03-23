const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const chalk = require('chalk')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ClientBundle'
const publicPath = path.join(RoutesHandler.getPublicPath(routes), 'dist')

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'production',
  name: bundleName,
  entry: [
    path.resolve(__dirname, '../../node_modules/@babel/polyfill'),
    path.resolve(__dirname, './src/index.jsx')
  ],
  output: {
    // Output dist files directly in projects public folder
    path: path.resolve(__dirname, './public/dist/'),
    publicPath: publicPath,
    filename: 'app.dist.js'
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, '../../node_modules/'),
        query: {
          presets: [
            [path.resolve(__dirname, '../../node_modules/@babel/preset-env'), { targets: { browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR'] } }],
            path.resolve(__dirname, '../../node_modules/babel-preset-react')
          ],
          plugins: [
            path.resolve(__dirname, '../../node_modules/babel-plugin-transform-class-properties'),
            path.resolve(__dirname, '../../node_modules/babel-plugin-transform-object-rest-spread')
          ]
        }
      },
      {
        test: /\.(css)$/,
        rules: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: '[name]-[local]-[hash:base64:5]'
            }
          }
        ]
      },
      {
        test: /\.(svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
          publicPath: publicPath
        }
      }
    ]
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new ProgressBarPlugin({
      format: chalk.greenBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*']
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new HtmlWebpackPlugin({
      title: 'Simple-React'
    })
  ]
}
