/**
 * Outputs the response as HTML document
 */

function ThisModule () {
  const self = this
  self.identity = 'html-output' // Controller name used in routes, policies and followups
  self.version = '1.0' // Version number of service

  self.all = function (req, res) {
    res.response = '<!DOCTYPE html>' + res.response
    res.send(res.response)
  }

  return self
}

module.exports = new ThisModule()
