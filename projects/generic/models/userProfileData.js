var BaseModel = require('mia-js-core/lib/baseModel')

function ThisModule () {
  var model = BaseModel.extend({
    data: {
      createdAt: {
        type: Date
      },
      updatedAt: {
        type: Date
      }
    }
  },
  {
    disabled: false, // Enable /disable model
    identity: 'generic-userProfile-model', // Model name
    version: '1.0', // Version number
    created: '2015-03-16T19:00:00', // Creation date
    modified: '2015-03-16T19:00:00', // Last modified date
    collectionName: 'userProfile'
  })

  return model
}

module.exports = ThisModule()
