const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ServerBundle'
const publicPath = RoutesHandler.getPublicPath(routes)
const webpackLoaders = require('./tools/webpack.loaders.config')('server', 'fs', path.join(publicPath, 'dist'))

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'production',
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
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['server.dist.js']
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      WEBPACK_OUTPUT_PATH: JSON.stringify(path.join(publicPath, 'dist/'))
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new ProgressBarPlugin({
      format: chalk.blueBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    })
  ]
}
