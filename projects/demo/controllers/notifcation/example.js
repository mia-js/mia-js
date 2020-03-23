/**
 * @module      :: Notification example
 */

const MiaJs = require('mia-js-core')
const Logger = MiaJs.Logger.tag('demo')
const Shared = MiaJs.Shared
const NotificationManager = Shared.libs('generic-notificationManager')

function ThisModule () {
  const self = this
  self.disabled = false // Enable /disable controller
  self.identity = 'demo-notification' // Unique controller id used in routes, policies and followups
  self.version = '1.0' // Version number of service
  self.created = '2015-07-14T12:00:00' // Creation date of controller
  self.modified = '2020-03-16T15:00:00' // Last modified date of controller
  self.group = 'demo' // Group this service to a origin

  /* Available default methods used for routing:
     all, list, index, create, update, delete, post, put, get */

  // Check access. Using all responds to all request types like POST, PUT, DELETE, GET
  self.all = function (req, res, next) {
    // Add a custom notification to the notification queue

    NotificationManager.mail({
      configId: 'notification-templates.notifications', // Config identifier of your project
      template: 'welcome', // Template name to use
      replacements: { // Replace occurrences of i.e [name] with value of name given in replacements
        name: 'John',
        lastName: 'Wayne'
      }
    }).address('me@domain.com').then(function () {
      next()
    }).catch(function (err) {
      // Error handling. Will only fail if not possible to add to queue
      Logger.error(err)
      next({ status: 500 })
    })
  }

  return self
}

module.exports = new ThisModule()
