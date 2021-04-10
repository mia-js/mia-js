/**
 * NotificationManager
 * Usage example:
 *
 NotificationManager.mail({
            configId: "example-templates.notifications",
            template: "resetPassword",
            language: "en" // OPTIONAL
            replacements: { //OPTIONAL
                name: "Test",
                email: "me@example.com"
 },
 schedule: new Date(Date.now()+60*5*1000) // OPTIONAL: Set a schedule date for the notification
 }).address("adrian@kuehlewind.net").catch((err)=> {
            Logger.error(err);
        });

 NotificationManager.push({
            configId: "example-templates.notifications",
            template: "resetPassword",
            language: "en" // OPTIONAL USE DEVICE LANGUAGE SETTINGS AS DEFAULT WHEN NOT SET
            replacements: { //OPTIONAL
                name: "Test"
            },
            payload: {} // OPTIONAL: Put in any object you like to submit to the app as payload
            schedule: new Date(Date.now()+60*5*1000) // OPTIONAL: Set a schedule date for the notification
        }).user("5538b7b3f0007f6ce1000006").catch((err)=>{
            Logger.error(err);
        });

 NotificationManager.push({
            configId: "example-templates.notifications",
            template: "resetPassword",
            language: "en" // OPTIONAL USE DEVICE LANGUAGE SETTINGS AS DEFAULT WHEN NOT SET
            replacements: { //OPTIONAL
                name: "Test"
            }
        }).device("3f90f57437acb4dfd7f0f9221763ae32").catch((err)=> {
            Logger.error(err);
        });

 */

const Q = require('q')
const _ = require('lodash')
const MiaJs = require('mia-js-core')
const Shared = MiaJs.Shared
const AuthManager = Shared.libs('generic-userAuthManager')
const NotificationModel = Shared.models('generic-notifications-model')

Q.stopUnhandledRejectionTracking()

function ThisModule () {
  const self = this

  self.identity = 'generic-notificationManager' // Controller name used in routes, policies and followups
  self.version = '1.0' // Version number of service

  /**
   * Push notification to db collection
   * @param data
   * @returns {*}
   * @private
   */
  const _pushToQueue = (data) => {
    return NotificationModel.validate(data).then((validatedData) => {
      return NotificationModel.insertOne(validatedData)
    })
  }

  /**
   * Validate given notification parameter
   * @param data
   * @param type
   * @returns {*}
   * @private
   */
  const _validateNotificationSettings = (data, type) => {
    // Check if notification configId exists
    if (!data.configId || _.isEmpty(Shared.config(data.configId))) {
      return Promise.reject(new MiaJs.Error({ code: 'ConfigIdNotFound', msg: 'Notification configId not found' }))
    }
    // let config = Shared.config(data.configId)
    // Check if template exists
    /* if (_.isEmpty(data.template) || !config.templates || !config.templates[data.template]) {
     return Promise.reject({code: "TemplateNotFound", msg: "Template not found"});
     } */

    // Check if schedule exists
    if (data.schedule && (Object.prototype.toString.call(data.schedule) !== '[object Date]' || data.schedule == 'Invalid Date')) { // eslint-disable-line eqeqeq
      return Promise.reject(new MiaJs.Error({ code: 'NotificationScheduleInvalid', msg: 'Notification schedule date is invalid' }))
    }

    // Check if template has this method
    /* if (_.isEmpty(config.templates[data.template][type])) {
     return Promise.reject({
     code: "MethodNotFoundInTemplate",
     msg: "Method " + type + " was not found in template"
     });
     } */
    return Promise.resolve()
  }

  /**
   * Prepare notification data
   * @param data
   * @param to
   * @param type
   * @returns {object}
   * @private
   */
  const _notificationDataFormater = (data, to, type) => {
    const formatted = {
      configId: data.configId,
      type: type,
      notification: {
        template: data.template,
        to: to,
        replacements: data.replacements,
        payload: data.payload
      },
      schedule: data.schedule || new Date(Date.now()),
      created: new Date(Date.now())
    }

    if (data.language && _.isString(data.language)) {
      formatted.notification.language = data.language
    }

    if (parseInt(data.badge) >= 0) {
      formatted.notification.badge = data.badge
    }

    return formatted
  }

  /**
   * Send mail notification
   * @param data
   * @returns {thisModule}
   */
  self.mail = (data) => {
    const type = 'mail'
    return {
      address: (to) => {
        if (_.isEmpty(to) || !to.match(/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)) {
          return Promise.reject(new MiaJs.Error({ code: 'InvalidEmailAddress', msg: 'Invalid email address' }))
        } else {
          return _validateNotificationSettings(data, type).then(() => {
            return _pushToQueue(_notificationDataFormater(data, to, type))
          })
        }
      },
      user: (userId) => {
        if (_.isEmpty(userId)) {
          return Promise.reject(new MiaJs.Error({ code: 'EmptyUserId', msg: 'No user id given' }))
        }
        return _validateNotificationSettings(data, type).then(() => {
          return AuthManager.getUserDataById(userId).then((userData) => {
            if (!_.isEmpty(userData)) {
              const funcArray = []
              const messaging = userData.messaging || []
              messaging.forEach((messageType) => {
                if (messageType.type === 'email' && !_.isEmpty(messageType.value) && messageType.value.match(/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)) {
                  funcArray.push(_pushToQueue(_notificationDataFormater(data, messageType.value, type)))
                }
              })
              return Q.all(funcArray)
            } else {
              return Promise.reject(new MiaJs.Error({ code: 'NoUserDevices', msg: 'User is not logged in on any device' }))
            }
          })
        })
      }
    }
  }

  /**
   * Send push notification
   * @param data
   * @returns {thisModule}
   */
  self.push = (data) => {
    const type = 'push'
    // Send push to user
    return {
      user: (userId) => {
        if (_.isEmpty(userId)) {
          return Promise.reject(new MiaJs.Error({ code: 'EmptyUserId', msg: 'No user id given' }))
        }
        return _validateNotificationSettings(data, type).then(() => {
          return AuthManager.getDevicesUserIsLoggedInOnByUserId(userId).then((deviceIds) => {
            if (deviceIds.length > 0) {
              const funcArray = []
              deviceIds.forEach((deviceId) => {
                // TODO: Optionally check if deviceID and push token exists exists. Will be checked by notificationProcessor cron anyway.
                funcArray.push(_pushToQueue(_notificationDataFormater(data, deviceId, type)))
              })
              return Q.all(funcArray)
            } else {
              return Promise.reject(new MiaJs.Error({ code: 'NoUserDevices', msg: 'User is not logged in on any device' }))
            }
          })
        })
      },
      // Send push to device
      device: (deviceId) => {
        if (_.isEmpty(deviceId)) {
          return Promise.reject(new MiaJs.Error({ code: 'EmptyDeviceId', msg: 'No device id given' }))
        }
        return _validateNotificationSettings(data, type).then(() => {
          // TODO: Check if deviceID and push token exists exists if needed. Will be checked by notificationProcessor cron anyway
          return _pushToQueue(_notificationDataFormater(data, deviceId, type))
        })
      }
    }
  }

  return self
}

module.exports = new ThisModule()
