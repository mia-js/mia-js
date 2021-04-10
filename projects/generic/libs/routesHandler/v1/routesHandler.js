function ThisModule () {
  const self = this

  self.identity = 'generic-routesHandler'
  self.version = '1.0'

  /**
   * Retrieves prefix from given routes file
   *
   * @param {object} routes
   * @return {string}
   */
  self.getPublicPath = function (routes) {
    const routesPrefix = Array.isArray(routes.prefix) ? routes.prefix[0] : routes.prefix

    return routesPrefix ? routesPrefix + '/' : '/'
  }

  return self
}

module.exports = new ThisModule()
