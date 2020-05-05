var _ = require('lodash')
var Q = require('q')
var FbGraph = require('fbgraphapi')

Q.stopUnhandledRejectionTracking()

function ThisModule () {
  var self = this

  self.identity = 'generic-fbLoginProvider' // Controller name used in routes, policies and followups
  self.version = '1.0' // Version number of service

  var defaultQueryFields = function (fields) {
    var fieldsArray = _.isEmpty(fields) ? [] : fields.split(',')
    // Add default fields
    fieldsArray.push('name')
    fieldsArray.push('id')
    fieldsArray.push('email')

    fieldsArray = _.uniq(fieldsArray)
    var fieldsString = fieldsArray.join(',')
    return fieldsString
  }

  self.checkCredentialsAndLoadProfile = function (fbToken, version, fields) {
    fields = fields || defaultQueryFields(fields)
    version = version || 'v6.0'
    var fb = new FbGraph.Facebook(fbToken, version)
    return Q.ninvoke(fb, 'graph', '/me?fields=' + fields).then(function (me) {
      return Q({
        thirdPartyLogin: {
          provider: 'fb',
          id: me.id
        },
        email: me.email,
        me: me
      })
    })
  }

  self.getUserPicture = function (fbToken, fbId, version, queryParams) {
    version = version || 'v2.9'
    var fb = new FbGraph.Facebook(fbToken, version)
    return Q.ninvoke(fb, 'graph', '/' + fbId + '/picture?redirect=false' + (queryParams ? ('&' + queryParams) : '')).then(function (result) {
      return Q(result.data)
    })
  }

  return self
}

module.exports = new ThisModule()
