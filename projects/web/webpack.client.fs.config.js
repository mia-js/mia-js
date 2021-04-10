const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')
const crypto = require('crypto')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ClientBundle'
const publicPath = path.join(RoutesHandler.getPublicPath(routes), 'dist')
const webpackLoaders = require('./tools/webpack.loaders.config')('client', 'fs', publicPath)
const versionHash = crypto.createHash('md5').update(String(process.pid)).digest('hex')

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'production',
  name: bundleName,
  entry: [
    path.resolve(__dirname, '../../node_modules/@babel/polyfill'),
    path.resolve(__dirname, './src/client.jsx')
  ],
  output: {
    // Output dist files directly in projects public folder
    path: path.resolve(__dirname, './public/dist/'),
    publicPath: publicPath,
    filename: `client-${versionHash}.dist.js`
  },
  module: {
    rules: webpackLoaders
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*']
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      __VERSION_HASH__: JSON.stringify(versionHash)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new ProgressBarPlugin({
      format: chalk.magentaBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    })
  ]
}
