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

var _ = require('lodash')
    , MiaJs = require('mia-js-core')
    , Utils = MiaJs.Utils
    , Logger = MiaJs.Logger
    , CronJobs = MiaJs.CronJobs
    , BaseCronJob = CronJobs.BaseCronJob
    , Shared = MiaJs.Shared
    , Q = require('q')
    , Emailjs = require("emailjs")
    , Encryption = require("mia-js-core/lib/utils").Encryption
    , Apn = require('apn')
    , NotificationModel = Shared.models('generic-notifications-model')
    , AuthService = Shared.libs("generic-deviceAndSessionAuth");

Q.stopUnhandledRejectionTracking();

//Send email
var _sendMail = function (smtpServer, sender, to, replyTo, subject, text, html) {
    var deferred = Q.defer();
    smtpServer.send({
        text: text,
        from: sender,
        "reply-to": replyTo,
        to: to,
        subject: subject,
        attachment: [
            {data: html, alternative: true}
        ]
    }, function (err, message) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};


// Set notification to fulfilled
var _notificationStatusFulfilled = function (id) {
    return NotificationModel.findOneAndUpdate({_id: id}, {
        $set: {
            status: "fulfilled",
            processed: new Date(Date.now())
        }
    }, {
        partial: true, upsert: false, returnOriginal: false
    });
};

//Set notification to rejected
var _notificationStatusReject = function (id, err) {
    return NotificationModel.findOneAndUpdate({_id: id}, {
        $set: {
            status: "rejected",
            log: err || "Unknown error"
        }
    }, {
        partial: true, upsert: false, returnOriginal: false
    });
};

//Set notification log
var _notificationAddLog = function (id, info) {
    return NotificationModel.findOneAndUpdate({_id: id}, {
        $set: {
            log: info
        }
    }, {
        partial: true, upsert: false, returnOriginal: false
    });
};

//Set notification to retry
var _notificationStatusRetry = function (id, log, schedule) {
    return NotificationModel.findOneAndUpdate({_id: id}, {
        $set: {
            status: "retry",
            schedule: schedule || new Date(Date.now() + 1000 * 60 * 6), // Retry in 5*retry minute
            workerId: null,
            log: log || "Unknown error"
        },
        '$inc': {
            'retry': 1
        }
    }, {
        partial: true, upsert: false, returnOriginal: false
    });
};

// Get template data
var _getTemplateData = function (id, configId, connector, type, notification, language) {
    var model = Shared.config(configId) || {};
    var name = notification.template;
    var defaultLanguage = model.defaultLanguage || "en";

    // Check if template exists
    if (_.isEmpty(model) || !model.templates || !model.templates[language] || _.isEmpty(model.templates[language]) || !model.templates[language][name] || _.isEmpty(model.templates[language][name]) || !model.templates[language][name][type] || _.isEmpty(model.templates[language][name][type]) || !model.templates[language][name][type][connector] || _.isEmpty(model.templates[language][name][type][connector])) {

        //Fallback to default language
        if (_.isEmpty(model) || !model.templates || !model.templates[defaultLanguage] || _.isEmpty(model.templates[defaultLanguage]) || !model.templates[defaultLanguage][name] || _.isEmpty(model.templates[defaultLanguage][name]) || !model.templates[defaultLanguage][name][type] || _.isEmpty(model.templates[defaultLanguage][name][type]) || !model.templates[defaultLanguage][name][type][connector] || _.isEmpty(model.templates[defaultLanguage][name][type][connector])) {

            //Check fallback without language prefix
            if (_.isEmpty(model) || !model.templates || !model.templates[name] || _.isEmpty(model.templates[name]) || !model.templates[name][type] || _.isEmpty(model.templates[name][type]) || !model.templates[name][type][connector] || _.isEmpty(model.templates[name][type][connector])) {
                return Q.reject("No template found");
            }
            else {
                return Q.resolve(_.cloneDeep(model.templates[name][type][connector]));
            }
        }
        else {
            _notificationAddLog(id, "Fallback to language " + defaultLanguage + " due to missing localization notification template");
            return Q.resolve(_.cloneDeep(model.templates[defaultLanguage][name][type][connector]));
        }
    }
    else {
        return Q.resolve(_.cloneDeep(model.templates[language][name][type][connector]));
    }
};

//Get connector data
var _getConnector = function (id, type, environment) {
    environment = environment || "production";
    var model = Shared.config(id) || {};
    if (_.isEmpty(model) || !model.connectors || !model.connectors[type] || !model.connectors[type][environment] || _.isEmpty(model.connectors[type][environment])) {
        return Q.reject("No connector found");
    }
    return Q.resolve(model.connectors[type][environment]);
};

//Do text replacements i.e. [name] -> Josh Miller
var _doReplacements = function (text, replacements) {
    for (var index in replacements) {
        var regEx = new RegExp("\\[" + index + "\\]", "ig");
        text = text.replace(regEx, replacements[index]);
    }
    return text;
};

function _doReplacementsDeep(objSource, replacements) {
    if (typeof objSource === "object") {
        if (objSource === null) return null;

        if (objSource instanceof Array) {
            for (var i = 0; i < objSource.length; i++) {
                objSource[i] = _doReplacementsDeep(objSource[i], replacements);
            }
        } else {
            for (var property in objSource) {
                objSource[property] = _doReplacementsDeep(objSource[property], replacements);
            }
        }
        return objSource;
    }

    if (typeof objSource === "string") {
        return _doReplacements(objSource, replacements);
    }
    return objSource;
}


// Email connections
var _emailConnections = {};
// Process email.
var _processEmail = function (data) {
    return _getConnector(data.configId, "smtp", Shared.config('environment').mode).then(function (connector) {

        var connectorId = Encryption.md5(JSON.stringify(connector));

        if (!_apnConnections[connectorId]) {
            _emailConnections[connector] = Emailjs.server.connect(connector);
        }

        var smtpServer = _emailConnections[connector];
        var notification = data.notification;
        return Q().then(function () {
            return _getTemplateData(data._id, data.configId, "smtp", "mail", notification, notification.language).fail(function () {
                return Q.reject("Invalid template for email");
            });
        }).then(function (template) {
            // Do replacements
            if (notification.replacements && !_.isEmpty(notification.replacements)) {
                template.html = _doReplacements(template.html, notification.replacements);
                template.sender = _doReplacements(template.sender, notification.replacements);
                if (template.replyTo) {
                    template.replyTo = _doReplacements(template.replyTo, notification.replacements);
                }
                else {
                    template.replyTo = template.sender;
                }
                template.subject = _doReplacements(template.subject, notification.replacements);
                template.text = _doReplacements(template.text, notification.replacements);
                template.text = template.text.replace(/\n/g, "<br>"); // prevent bare LF issue with smtp
            }

            return _sendMail(smtpServer, template.sender, notification.to, template.replyTo, template.subject, template.text, template.html)
                .then(function () {
                    Logger.info("Email " + data._id + " send to " + notification.to);
                    _notificationStatusFulfilled(data._id);
                    return Q.resolve();
                }).fail(function (err) {
                    Logger.error("Email " + data._id + " NOT send to " + notification.to);
                    if (err && err.code) {
                        switch (err.code) {
                            case 1:
                                _notificationStatusRetry(data._id, err);
                                return Q.resolve();
                                break;
                            case 4:
                                _notificationStatusRetry(data._id, err);
                                return Q.resolve();
                                break;
                            default:
                                return Q.reject(err);
                        }
                    }
                    return Q.reject(err);
                });
        });
    }).fail(function (err) {
        _notificationStatusReject(data._id, err);
        return Q.reject();
    });
};

// Open connections for APNS
var  _apnConnections = {};

// Send push notification to Apple Push Notification Services (APNS)
var _sendApn = function (data, deviceData) {

    if (!deviceData.device || !deviceData.device.notification || !deviceData.device.notification.token) {
        _notificationStatusReject(data._id, "Device is not registered for push. Missing push token");
        return Q.reject("Device is not registered for push. Missing push token");
    }

    var environment = deviceData.device && deviceData.device.notification && deviceData.device.notification.environment ? deviceData.device.notification.environment : "production";

    return _getConnector(data.configId, "apns", environment).then(function (connector) {

        var connectorId = Encryption.md5(JSON.stringify(connector));

        // Reuse connection or register new APN connection if not exists
        if (!_apnConnections[connectorId]) {
            _apnConnections[connectorId] = new Apn.Connection(connector);

            _apnConnections[connectorId].on("connected", function () {
                Logger.info("Connected to APNS (" + environment + ")");
            });
            _apnConnections[connectorId].on("transmitted", function (notification, device) {
                var messageId = notification.payload.messageId;
                Logger.info("Notification " + messageId.toString() + " transmitted to: " + device.token.toString("hex"));
                _notificationStatusFulfilled(messageId);
            });
            _apnConnections[connectorId].on("transmissionError", function (errCode, notification, device) {
                var messageId = notification.payload.messageId;
                Logger.error("Notification " + messageId.toString() + " caused error: " + errCode + " for device ", device, notification);
                if (errCode === 8) {
                    Logger.warn("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
                    _notificationStatusReject(messageId, "Device token is invalid");
                } else {
                    _notificationStatusReject(messageId, "APN Transmission error occured");
                }
            });
            _apnConnections[connectorId].on("timeout", function () {
                Logger.info("Connection Timeout");
            });
            _apnConnections[connectorId].on("disconnected", function () {
                Logger.info("Disconnected from APNS");
            });
            _apnConnections[connectorId].on("socketError", function (err) {
                Logger.error("Socket connection error. Check config settings", err);
            });

            _apnConnections[connectorId].on("error", function (err) {
                Logger.error("Error occured while sending push notification to APNS", err);
            });
        }

        var service = _apnConnections[connectorId];

        var notification = data.notification;
        var language = deviceData && deviceData.culture && deviceData.culture.language ? deviceData.culture.language : null;

        return _getTemplateData(data._id, data.configId, "apns", "push", notification, language).then(function (template) {
            //Do replacements
            if (template.alert && template.alert.title) {
                template.alert.title = _doReplacements(template.alert.title, notification.replacements);
            }
            if (template.alert && template.alert.body) {
                template.alert.body = _doReplacements(template.alert.body, notification.replacements);
            }

            //Handle payload
            var payload = template.payload ? _.merge(template.payload, data.notification.payload) : data.notification.payload;
            payload = _doReplacementsDeep(payload, notification.replacements) || {};
            payload.messageId = data._id;
            var pushData = new Apn.Notification();

            if (template.alert) {
                pushData.alert = template.alert;
            }

            if (data.notification.badge || template.badge) {
                pushData.badge = data.notification.badge || template.badge;
            }

            if (template.sound) {
                pushData.sound = template.sound;
            }

            if (template["content-available"]) {
                pushData.contentAvailable = template["content-available"];
            }

            if (!_.isEmpty(payload)) {
                pushData.payload = payload;
            }
            service.pushNotification(pushData, [deviceData.device.notification.token]);
            return Q.resolve();
        });
    }).fail(function (err) {
        _notificationStatusReject(data._id, err);
        return Q.reject(err);
    });


};

// Process push. Lookup deviceId and push token and call push handler of device os type
var _processPush = function (data, workerId) {
    return AuthService.getDeviceDataById(data.notification.to).then(function (deviceData) {
        if (deviceData.device && deviceData.device.os && deviceData.device.os.type) {
            var deviceType = deviceData.device.os.type;
            if (deviceType == "ios") {
                return _sendApn(data, deviceData, workerId);
            }
            else if (deviceType == "android") {
                return _notificationStatusReject(data._id, "Unknown device type").then(function () {
                    return Q.reject();
                });
            }
            else {
                return _notificationStatusReject(data._id, "Unknown device type").then(function () {
                    return Q.reject();
                });
            }
        }
        else if (deviceData.device) {
            //temp workaround
            return _sendApn(data, deviceData, workerId);
        }
        else {
            return _notificationStatusReject(data._id, "Unknown device type").then(function () {
                return Q.reject();
            });
        }
    }).fail(function (err) {
        var error = err || "Device failure";
        return _notificationStatusReject(data._id, error).then(function () {
            return Q.reject();
        });
    });
};

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
            month: '0-12',   // names are also allowed
            timezone: 'CET'
        },

        isSuspended: false,
        debugOutput: false,
        allowedHosts: [],

        maxInstanceNumberTotal: 0,
        maxInstanceNumberPerServer: 10,

        identity: 'generic-notificationProcessor', // Job name

        worker: function () {
            var workerId = Encryption.randHash();
            // Assign all notifications to this worker where schedule is due and status is pending or retry and no other worker is already processing
            return NotificationModel.updateMany({
                    $or: [
                        {status: "pending"},
                        {status: "retry"}
                    ],
                    schedule: {$lte: new Date(Date.now())},
                    workerId: null
                },
                {
                    '$set': {
                        workerId: workerId,
                        status: "processing"
                    }
                },
                {
                    partial: true,
                    validate: false
                }).then(function (data) {
                    var affectedItems = data.result && data.result.nModified ? data.result.nModified : 0;
                    if (affectedItems > 0) {
                        return NotificationModel.find({workerId: workerId}).then(function (notifications) {
                            return Q.ninvoke(notifications, 'toArray').then(function (results) {
                                var funcArray = [];
                                for (var index in results) {
                                    var data = results[index];
                                    // Check notification types
                                    if (data.type == "mail") {
                                        funcArray.push(_processEmail(data));
                                    }
                                    else if (data.type == "push") {
                                        funcArray.push(_processPush(data));
                                    }
                                    else {
                                        _notificationStatusReject(data, "Notification type not supported");
                                    }
                                }
                                return Q.allSettled(funcArray);
                            });

                        });
                    }
                    else {
                        return Q();
                    }
                }).fail(function (err) {
                    Logger.error(err);
                    return Q().reject();
                });
        },
        created: '2015-04-05T22:00:00', // Creation date
        modified: '2015-04-05T22:00:00' // Last modified date
    }
);
