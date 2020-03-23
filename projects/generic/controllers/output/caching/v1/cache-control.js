/**
 * @description :: Sets the Cache-Control Header to the response object
 */
const _ = require('lodash')
const MiaJs = require('mia-js-core')

function ThisModule () {
  const self = this
  self.identity = 'generic-cachingCacheControl' // Controller name used in routes, policies and followups
  self.version = '1.0' // Version number of service

  self.all = function (...args) {
    let err, req, res, next // eslint-disable-line no-unused-vars

    if (args.length === 4) {
      [err, req, res, next] = args
    } else {
      [req, res, next] = args
    }

    let maxAge = 0

    // Set max-age to timeleft if res.cached is provided
    if (res.cached && res.cached.cacheTime && _.isNumber(res.cached.cacheTime)) {
      maxAge = res.cached.cacheTime
    }

    res.setHeader('Cache-Control', 'public, max-age=' + maxAge)

    if (err) {
      err = new MiaJs.Error(err)
    }

    next(err)
  }

  return self
}

module.exports = new ThisModule()
