function ThisModule () {
  const self = this

  self.init = function () {
    // Add some initial tasks here run on server startup i.e. writing initial data
  }

  return self
}

module.exports = new ThisModule()
