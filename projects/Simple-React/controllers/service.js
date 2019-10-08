const path = require('path')

function thisModule () {
  let self = this

  self.identity = 'Simple-React-Service'
  self.version = '1.0'

  self.list = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dist/index.html'))
  }

  return self
}

module.exports = new thisModule()
