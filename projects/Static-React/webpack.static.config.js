const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin')
const chalk = require('chalk')
const jsdom = require('jsdom')
const routes = require('./routes')
const RoutesHandler = require('../generic/libs/routesHandler/v1/routesHandler')

const projectName = path.resolve(__dirname).split(path.sep).pop()
const bundleName = projectName + 'ServerBundle'
const publicPath = RoutesHandler.getPublicPath(routes)

/**
 * Mock browser DOM
 */
const { JSDOM } = jsdom
const DOM = new JSDOM()
const { window } = DOM

// Hide deprecation warnings from loader-utils
process.noDeprecation = true

module.exports = {
  mode: 'production',
  name: bundleName,
  entry: path.resolve(__dirname, './src/server.jsx'),
  output: {
    libraryTarget: 'commonjs',
    // Output dist files directly in projects public folder
    path: path.resolve(__dirname, './public/'),
    publicPath: publicPath,
    filename: 'static.dist.js'
  },
  target: 'node',
  externals: [
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules/')
    })
  ],
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, '../../node_modules/'),
        query: {
          presets: [
            [path.resolve(__dirname, '../../node_modules/@babel/preset-env'), { targets: { node: true } }],
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
            issuer: { not: [/\.(css)$/] },
            use: 'isomorphic-style-loader'
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
          publicPath: publicPath,
          emitFile: false
        }
      }
    ]
  },
  optimization: {
    noEmitOnErrors: true
  },
  plugins: [
    new ProgressBarPlugin({
      format: chalk.yellowBright(`${bundleName} [:bar] :percent (:elapsed seconds)`),
      summary: false
    }),
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: ['static.dist.js', 'page/*', 'index.html'],
      cleanAfterEveryBuildPatterns: ['static.dist.js']
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      WEBPACK_OUTPUT_PATH: JSON.stringify(publicPath)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new StaticSiteGeneratorPlugin({
      basename: publicPath === '/' ? '' : publicPath.substring(0, publicPath.length - 1),
      crawl: true,
      globals: {
        window,
        document: window.document
      }
    })
  ]
}
