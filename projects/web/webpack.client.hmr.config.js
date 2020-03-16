const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ClientBundleForHMR'
const publicPath = path.join(RoutesHandler.getPublicPath(routes), 'dist')
const webpackLoaders = require('./tools/webpack.loaders.config')('client', 'watch', publicPath)

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'development',
  name: bundleName,
  entry: [
    path.resolve(__dirname, './../../node_modules/@babel/polyfill'),
        `webpack-hot-middleware/client?path=${publicPath}__webpack_hmr&name=${bundleName}`,
        path.resolve(__dirname, './src/client.jsx')
  ],
  output: {
    // Output dist files directly in projects public folder
    path: path.resolve(__dirname, './public/dist/'),
    publicPath: publicPath,
    filename: 'client.dist.js'
  },
  devtool: 'eval-source-map',
  module: {
    rules: webpackLoaders
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin({
      format: chalk.magentaBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    })
  ]
}
