/**
 * Process notifications from notification collection
 * */

// Cron pattern:
//    minute         0-59
//    hour           0-23
//    day of month   0-31
//    month          0-12 (or names, see below)
//    day of week    0-7 (0 or 7 is Sun, or use names)
//
// A field  may  be an asterisk (*), which always stands for
// ``first-last''.
//
// Ranges of numbers are allowed.   Ranges  are  two  numbers
// separated  with  a  hyphen.  The specified range is inclu-
// sive.  For example, 8-11 for an ``hours'' entry  specifies
// execution at hours 8, 9, 10 and 11.
//
// Lists are allowed.  A list is a set of numbers (or ranges)
// separated by commas.  Examples: ``1,2,5,9'', ``0-4,8-12''.
//
// Step  values can be used in conjunction with ranges.  Fol-
// lowing a range with ``/<number>'' specifies skips  of  the
// number's value through the range.  For example, ``0-23/2''
// can be used in the hours field to specify  command  execu-
// tion  every other hour (the alternative in the V7 standard
// is ``0,2,4,6,8,10,12,14,16,18,20,22'').   Steps  are  also
// permitted after an asterisk, so if you want to say ``every
// two hours'', just use ``*/2''.
//
// Names can also be used for  the  ``month''  and  ``day  of
// week'' fields.  Use the first three letters of the partic-
// ular day or month (case doesn't matter).  Ranges or  lists
// of names are not allowed.
//
// Note: The day of a command's execution can be specified by
// two  fields  --  day  of  month, and day of week.  If both
// fields are restricted (ie, aren't *), the command will  be
// run when either field matches the current time.  For exam-
// ple,
// ``30 4 1,15 * 5'' would cause a command to be run at  4:30
// am on the 1st and 15th of each month, plus every Friday.

const _ = require('lodash')
const MiaJs = require('mia-js-core')
const Logger = MiaJs.Logger
const CronJobs = MiaJs.CronJobs
const BaseCronJob = CronJobs.BaseCronJob
const Shared = MiaJs.Shared
const Q = require('q')
const Emailjs = require('emailjs')
const Encryption = require('mia-js-core/lib/utils').Encryption
const Apn = require('apn')
const NotificationModel = Shared.models('generic-notifications-model')
const AuthService = Shared.libs('generic-deviceAndSessionAuth')
// let DeviceModel = Shared.models('generic-device-model')

Q.stopUnhandledRejectionTracking()

// Send email
const _sendMail = (smtpServer, sender, to, replyTo, subject, text, html) => {
  const deferred = Q.defer()
  smtpServer.send({
    text: text,
    from: sender,
    'reply-to': replyTo,
    to: to,
    subject: subject,
    attachment: [
      { data: html, alternative: true }
    ]
  }, (err, message) => {
    if (err) {
      deferred.reject(new MiaJs.Error(err))
    } else {
      deferred.resolve()
    }
  })
  return deferred.promise
}

// Set notification to fulfilled
const _notificationStatusFulfilled = (id) => {
  return NotificationModel.findOneAndUpdate({ _id: id }, {
    $set: {
      status: 'fulfilled',
      processed: new Date(Date.now())
    }
  }, {
    partial: true, upsert: false, returnDocument: 'after'
  })
}

// Remove push token from device in case token is invalid
const _unregisterDeviceNotification = (id) => {
  if (id) {
    // FIXME: Active device token remove after testing on prod worked
    // return DeviceModel.updateOne({ id }, { $unset: { 'device.notification.token': '' } })
  }
}

// Set notification to rejected
const _notificationStatusReject = (id, err) => {
  return NotificationModel.findOneAndUpdate({ _id: id }, {
    $set: {
      status: 'rejected',
      log: err || 'Unknown error'
    }
  }, {
    partial: true, upsert: false, returnDocument: 'after'
  })
}

// Set notification log
const _notificationAddLog = (id, info) => {
  return NotificationModel.findOneAndUpdate({ _id: id }, {
    $set: {
      log: info
    }
  }, {
    partial: true, upsert: false, returnDocument: 'after'
  })
}

// Set notification to retry
const _notificationStatusRetry = (id, log, schedule) => {
  return NotificationModel.findOneAndUpdate({ _id: id }, {
    $set: {
      status: 'retry',
      schedule: schedule || new Date(Date.now() + 1000 * 60 * 6), // Retry in 5*retry minute
      workerId: null,
      log: log || 'Unknown error'
    },
    $inc: {
      retry: 1
    }
  }, {
    partial: true, upsert: false, returnDocument: 'after'
  })
}

// Get template data
const _getTemplateData = (id, configId, connector, type, notification, language) => {
  const model = Shared.config(configId) || {}
  const name = notification.template
  const defaultLanguage = model.defaultLanguage || 'en'

  // Check if template exists
  if (_.isEmpty(model) || !model.templates || !model.templates[language] || _.isEmpty(model.templates[language]) || !model.templates[language][name] || _.isEmpty(model.templates[language][name]) || !model.templates[language][name][type] || _.isEmpty(model.templates[language][name][type]) || !model.templates[language][name][type][connector] || _.isEmpty(model.templates[language][name][type][connector])) {
    // Fallback to default language
    if (_.isEmpty(model) || !model.templates || !model.templates[defaultLanguage] || _.isEmpty(model.templates[defaultLanguage]) || !model.templates[defaultLanguage][name] || _.isEmpty(model.templates[defaultLanguage][name]) || !model.templates[defaultLanguage][name][type] || _.isEmpty(model.templates[defaultLanguage][name][type]) || !model.templates[defaultLanguage][name][type][connector] || _.isEmpty(model.templates[defaultLanguage][name][type][connector])) {
      // Check fallback without language prefix
      if (_.isEmpty(model) || !model.templates || !model.templates[name] || _.isEmpty(model.templates[name]) || !model.templates[name][type] || _.isEmpty(model.templates[name][type]) || !model.templates[name][type][connector] || _.isEmpty(model.templates[name][type][connector])) {
        return Promise.reject(new MiaJs.Error('No template found'))
      } else {
        return Promise.resolve(_.cloneDeep(model.templates[name][type][connector]))
      }
    } else {
      _notificationAddLog(id, 'Fallback to language ' + defaultLanguage + ' due to missing localization notification template')
      return Promise.resolve(_.cloneDeep(model.templates[defaultLanguage][name][type][connector]))
    }
  } else {
    return Promise.resolve(_.cloneDeep(model.templates[language][name][type][connector]))
  }
}

// Get connector data
const _getConnector = (id, type, environment) => {
  environment = environment || 'production'
  const model = Shared.config(id) || {}
  if (_.isEmpty(model) || !model.connectors || !model.connectors[type] || !model.connectors[type][environment] || _.isEmpty(model.connectors[type][environment])) {
    return Promise.reject(new MiaJs.Error('No connector found'))
  }
  return Promise.resolve(_.cloneDeep(model.connectors[type][environment]))
}

// Do text replacements i.e. [name] -> Josh Miller
const _doReplacements = (text, replacements) => {
  for (const index in replacements) {
    const regEx = new RegExp('\\[' + index + '\\]', 'ig')
    text = text.replace(regEx, replacements[index])
  }
  return text
}

function _doReplacementsDeep (objSource, replacements) {
  if (typeof objSource === 'object') {
    if (objSource === null) return null

    if (objSource instanceof Array) {
      for (let i = 0; i < objSource.length; i++) {
        objSource[i] = _doReplacementsDeep(objSource[i], replacements)
      }
    } else {
      for (const property in objSource) {
        objSource[property] = _doReplacementsDeep(objSource[property], replacements)
      }
    }
    return objSource
  }

  if (typeof objSource === 'string') {
    return _doReplacements(objSource, replacements)
  }
  return objSource
}

// Email connections
const _emailConnections = {}
// Process email.
const _processEmail = (data) => {
  return _getConnector(data.configId, 'smtp', Shared.config('environment').mode).then((connector) => {
    const connectorId = Encryption.md5(JSON.stringify(connector))

    if (!_apnConnections[connectorId]) {
      _emailConnections[connector] = Emailjs.server.connect(connector)
    }

    const smtpServer = _emailConnections[connector]
    const notification = data.notification
    return Promise.resolve().then(() => {
      return _getTemplateData(data._id, data.configId, 'smtp', 'mail', notification, notification.language).catch(() => {
        return Promise.reject(new MiaJs.Error('Invalid template for email'))
      })
    }).then((template) => {
      // Do replacements
      if (notification.replacements && !_.isEmpty(notification.replacements)) {
        template.html = _doReplacements(template.html, notification.replacements)
        template.sender = _doReplacements(template.sender, notification.replacements)
        if (template.replyTo) {
          template.replyTo = _doReplacements(template.replyTo, notification.replacements)
        } else {
          template.replyTo = template.sender
        }
        template.subject = _doReplacements(template.subject, notification.replacements)
        template.text = _doReplacements(template.text, notification.replacements)
        template.text = template.text.replace(/\n/g, '<br>') // prevent bare LF issue with smtp
      }

      return _sendMail(smtpServer, template.sender, notification.to, template.replyTo, template.subject, template.text, template.html)
        .then(() => {
          Logger.info('Email ' + data._id + ' send to ' + notification.to)
          _notificationStatusFulfilled(data._id)
          return Promise.resolve()
        }).catch((err) => {
          Logger.error('Email ' + data._id + ' NOT send to ' + notification.to)
          if (err && err.code) {
            switch (err.code) {
              case 1:
                _notificationStatusRetry(data._id, err)
                return Promise.resolve()
              case 4:
                _notificationStatusRetry(data._id, err)
                return Promise.resolve()
              default:
                return Promise.reject(new MiaJs.Error(err))
            }
          }
          return Promise.reject(new MiaJs.Error(err))
        })
    })
  }).catch((err) => {
    _notificationStatusReject(data._id, err)
    return Promise.reject(new MiaJs.Error(err))
  })
}

// Open connections for APNS
const _apnConnections = {}

// Send push notification to Apple Push Notification Services (APNS)
const _sendApn = async (data, deviceData) => {
  if (!deviceData.device || !deviceData.device.notification || !deviceData.device.notification.token) {
    return Promise.reject(new MiaJs.Error('Device is not registered for push. Missing push token'))
  }

  const environment = deviceData.device && deviceData.device.notification && deviceData.device.notification.environment ? deviceData.device.notification.environment : 'production'

  return _getConnector(data.configId, 'apns', environment).then((connector) => {
    const connectorId = Encryption.md5(JSON.stringify(connector))

    // Reuse connection or register new APN connection if not exists
    if (!_apnConnections[connectorId]) {
      _apnConnections[connectorId] = new Apn.Provider(connector)
    }

    const service = _apnConnections[connectorId]

    const notification = data.notification
    const language = deviceData && deviceData.culture && deviceData.culture.language ? deviceData.culture.language : null

    return _getTemplateData(data._id, data.configId, 'apns', 'push', notification, language).then((template) => {
      // Do replacements
      if (template.alert && template.alert.title) {
        template.alert.title = _doReplacements(template.alert.title, notification.replacements)
      }
      if (template.alert && template.alert.body) {
        template.alert.body = _doReplacements(template.alert.body, notification.replacements)
      }

      // Handle payload
      let payload = template.payload ? _.merge(template.payload, data.notification.payload) : data.notification.payload
      payload = _doReplacementsDeep(payload, notification.replacements) || {}
      payload.messageId = data._id
      const note = new Apn.Notification()

      if (template.alert) {
        note.alert = template.alert
      }

      if (data.notification.badge || template.badge) {
        note.badge = data.notification.badge || template.badge
      }

      if (template.sound) {
        note.sound = template.sound
      }

      if (template['content-available']) {
        note.contentAvailable = template['content-available']
      }

      if (!_.isEmpty(payload)) {
        note.payload = payload
      }

      note.topic = template.bundleId

      return service.send(note, deviceData.device.notification.token).then(async response => {
        const failedReason = _.get(response, 'failed.0.response.reason')
        if (failedReason) {
          if (failedReason === 'BadDeviceToken') {
            if (deviceData.id) {
              // Remove invalid push token from device
              await _unregisterDeviceNotification(deviceData.id)
            }
          }
          _notificationStatusReject(data._id, failedReason)
          return Promise.resolve()
        }
        _notificationStatusFulfilled(data._id)
        return Promise.resolve()
      }).catch(err => {
        Logger.error(err)
        _notificationStatusRetry(data._id, err)
        return Promise.resolve()
      })
    })
  })
}

// Process push. Lookup deviceId and push token and call push handler of device os type
const _processPush = (data, workerId) => {
  return AuthService.getDeviceDataById(data.notification.to).then((deviceData) => {
    if (deviceData === null) {
      return Promise.reject(new MiaJs.Error('Device does not exists'))
    }

    if (deviceData.device && deviceData.device.os && deviceData.device.os.type) {
      const deviceType = deviceData.device.os.type
      if (deviceType === 'ios') {
        return _sendApn(data, deviceData, workerId)
      } else if (deviceType === 'android') {
        return Promise.reject(new MiaJs.Error('Unknown device type'))
      } else {
        return Promise.reject(new MiaJs.Error('Unknown device type'))
      }
    } else if (deviceData.device) {
      // temp workaround
      return _sendApn(data, deviceData, workerId)
    } else {
      return Promise.reject(new MiaJs.Error('Unknown device type'))
    }
  }).catch((err) => {
    const error = _.get(err, 'err.msg') || err || new MiaJs.Error('Device failure')
    return _notificationStatusReject(data._id, error).then(() => {
      return Promise.reject(err)
    })
  })
}

/**
 * Custom cron job
 */
module.exports = BaseCronJob.extend({},
  {
    disabled: false, // Enable /disable job definition
    time: {
      hour: '0-23',
      minute: '0-59',
      second: '0-59/5',
      dayOfMonth: '0-31',
      dayOfWeek: '0-7', // (0 or 7 is Sun, or use names)
      month: '0-12', // names are also allowed
      timezone: 'CET'
    },

    isSuspended: false,
    debugOutput: false,
    allowedHosts: [],

    maxInstanceNumberTotal: 0,
    maxInstanceNumberPerServer: 10,

    identity: 'generic-notificationProcessor', // Job name

    worker: () => {
      const workerId = Encryption.randHash()
      // Assign all notifications to this worker where schedule is due and status is pending or retry and no other worker is already processing
      return NotificationModel.updateMany({
        $or: [
          { status: 'pending' },
          { status: 'retry' }
        ],
        schedule: { $lte: new Date(Date.now()) },
        workerId: null
      },
      {
        $set: {
          workerId: workerId,
          status: 'processing'
        }
      },
      {
        partial: true,
        validate: false
      }).then((data) => {
        const affectedItems = data.result && data.result.nModified ? data.result.nModified : 0
        if (affectedItems > 0) {
          return NotificationModel.find({ workerId: workerId }).then((notifications) => {
            return Q.ninvoke(notifications, 'toArray').then((results) => {
              const funcArray = []
              for (const index in results) {
                const data = results[index]
                // Check notification types
                if (data.type === 'mail') {
                  funcArray.push(_processEmail(data))
                } else if (data.type === 'push') {
                  funcArray.push(_processPush(data))
                } else {
                  _notificationStatusReject(data, 'Notification type not supported')
                }
              }
              return Q.allSettled(funcArray)
            })
          })
        } else {
          return Promise.resolve()
        }
      }).catch((err) => {
        Logger.error(err)
        return Promise.reject(new MiaJs.Error(err))
      })
    },
    created: '2015-04-05T22:00:00', // Creation date
    modified: '2020-03-13T18:00:00' // Last modified date
  }
)
