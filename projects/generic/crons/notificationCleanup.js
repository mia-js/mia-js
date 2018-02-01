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
    , Logger = MiaJs.Logger.tag('cron')
    , Utils = MiaJs.Utils
    , CronJobs = MiaJs.CronJobs
    , BaseCronJob = CronJobs.BaseCronJob
    , Shared = MiaJs.Shared
    , Q = require('q')
    , Encryption = require("mia-js-core/lib/utils").Encryption
    , NotificationModel = Shared.models('generic-notifications-model');

Q.stopUnhandledRejectionTracking();

/**
 * Remove notifications from notifications queue.
 * @private
 */
var _recycleNotifications = function () {
    var removeAfter = 60; //in minutes
    var removeTimeLimit = new Date(Date.now() - (removeAfter * 60 * 1000));  // Removes notification after 1h
    return NotificationModel.deleteMany({
        $or: [
            {
                'status': 'rejected',
                'schedule': {'$lte': removeTimeLimit}
            },
            {
                'status': 'fulfilled',
                'schedule': {'$lte': removeTimeLimit}
            }
        ]
    }, {
        validate: false
    }).then(function (data) {
        var deletedCount = data.deletedCount || 0;
        if (deletedCount > 0) {
            Logger.info("Removed " + deletedCount + " notifications.");
        }
    });
};

/**
 * Reset notification to pending if it got stock in processing for 10 minutes. Maybe a job crashed or was forced to stop
 * @returns {*}
 * @private
 */
var _resetNotifications = function () {
    var resetAfter = 10; // in minutes
    var messageAge = new Date(Date.now() - (resetAfter * 60 * 1000)); // Retry message send after 10min maked as processed but not send
    return NotificationModel.updateMany({
        'status': 'processing',
        'processed': null,
        'schedule': {'$lte': messageAge}

    }, {
        '$set': {
            'status': 'pending',
            'workerId': null
        }
    }, {
        partial: true,
        validate: false
    }).then(function (data) {
        var affectedItems = data.result && data.result.nModified ? data.result.nModified : 0;
        if (affectedItems > 0) {
            Logger.info("Reset " + affectedItems + " notifications to pending. Seems theses messages got stuck in process before.");
        }
    }).fail(function (err) {
        Logger.error(err);
    });
};

/**
 * Terminate sending of notification after 10 retries
 * @returns {*}
 * @private
 */
var _retryNotificationsTerminate = function () {
    return NotificationModel.updateMany({
        'status': 'retry',
        'retry': {'$gt': 25}
    }, {
        '$set': {
            'status': 'rejected',
            'workerId': null,
            'log': "Gave up after 25 retries"
        }
    }, {
        partial: true,
        validate: false
    }).then(function (data) {
        var affectedItems = data.result && data.result.nModified ? data.result.nModified : 0;
        if (affectedItems > 0) {
            Logger.warn("Giving up " + affectedItems + " notifications due to max reties reached.");
        }
    }).fail(function (err) {
        Logger.error(err);
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
            second: '20',
            dayOfMonth: '0-31',
            dayOfWeek: '0-7', // (0 or 7 is Sun, or use names)
            month: '0-12',   // names are also allowed
            timezone: 'CET'
        },

        isSuspended: false,
        debugOutput: false,
        allowedHosts: [],

        maxInstanceNumberTotal: 1,
        maxInstanceNumberPerServer: 1,

        identity: 'generic-notificationCleanup', // Job name

        worker: function () {
            return Q.allSettled([
                _recycleNotifications(),
                _resetNotifications(),
                _retryNotificationsTerminate()
            ]).then(function () {
                return Q();
            });
        },

        created: '2015-04-05T22:00:00', // Creation date
        modified: '2015-04-05T22:00:00' // Last modified date
    }
);
