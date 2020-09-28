const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')
const crypto = require('crypto')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ServerBundleForHMR'
const publicPath = RoutesHandler.getPublicPath(routes)
const webpackLoaders = require('./tools/webpack.loaders.config')('server', 'watch', path.join(publicPath, 'dist'))
const versionHash = crypto.createHash('md5').update(String(process.pid)).digest('hex')

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'development',
  name: bundleName,
  entry: path.resolve(__dirname, './src/server.jsx'),
  output: {
    libraryTarget: 'commonjs',
    // Output server package directly in controllers folder
    path: path.resolve(__dirname, './controllers'),
    // Get public path from projects routes config
    publicPath: publicPath,
    filename: 'server.dist.js'
  },
  devtool: 'eval-source-map',
  target: 'node',
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules/'),
      whitelist: [
        'bootstrap/dist/css/bootstrap.css',
        'font-awesome/css/font-awesome.css'
      ]
    })
  ],
  module: {
    rules: webpackLoaders
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      // Hot reloading with isomorphic-style-loader
      debug: true
    }),
    new webpack.DefinePlugin({
      __WEBPACK_OUTPUT_PATH__: JSON.stringify(path.join(publicPath, 'dist')),
      __VERSION_HASH__: JSON.stringify(versionHash)
    }),
    new ProgressBarPlugin({
      format: chalk.blueBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    })
  ]
}
