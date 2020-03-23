function ThisModule () {
  const self = this
  self.disabled = false // Enable /disable controller
  self.identity = 'demo-checkAccess' // Unique controller id used in routes, policies and followups
  self.version = '1.0' // Version number of service
  self.created = '2015-07-14T12:00:00' // Creation date of controller
  self.modified = '2020-03-16T15:00:00' // Last modified date of controller
  self.group = 'demo' // Group this service to a origin

  /*
     Preconditions:
     - Define preconditions for this controller as validity check before controller gets executed
     - Parameters: Parse and validate input data (available in req.miajs.validatedParameters)
     - Responses: Show up in docs and services listing for developers
     */
  self.preconditions = {
    all: {
      responses: {
        200: 'Success'
      }
    }
  }

  /* Available default methods used for routing:
     all, list, index, create, update, delete, post, put, get */

  // Check access. Using all responds to all request types like POST, PUT, DELETE, GET
  self.all = function (req, res, next) {
    // Do some checks here i.e. validate api key or ip address
    next()
  }

  return self
}

module.exports = new ThisModule()
