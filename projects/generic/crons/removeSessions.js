/**
 * Remove session and ip address from devices collection when expired
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

var _ = require('lodash');
//base class
var MiaJs = require('mia-js-core');
var Logger = MiaJs.Logger;
var Utils = MiaJs.Utils;
var CronJobs = MiaJs.CronJobs;
var BaseCronJob = CronJobs.BaseCronJob;
var Shared = MiaJs.Shared;

/**
 * Custom cron job
 */
module.exports = BaseCronJob.extend({},
    {
        disabled: false, // Enable /disable job definition
        time: {
            hour: '0-23',
            minute: '0-59',
            second: '0',
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

        identity: 'generic-removeSessions', // Job name

        worker: function () {
            var expireTime = 10; // Session expire time in minutes
            var deviceModel = Shared.models('generic-device-model');
            var expireDate = new Date(Date.now() - (expireTime * 60 * 1000));

            //Delete session node if session is expired
            return deviceModel.updateMany(
                {
                    'session.expireable': true,
                    'session.created': {$lte: expireDate}
                },
                {
                    $unset: {
                        'session.created': '',
                        'session.cidr': '',
                        'session.id': ''
                    }
                },
                {
                    validate: false
                }
            ).then(function (data) {
                    var nModified = data.result && data.result.nModified ? data.result.nModified : 0;
                    if (nModified > 0) {
                        Logger.info(nModified + ' sessions removed from devices collections');
                    }
                }).catch(function (err) {
                    Logger.info(null, err);
                });
        },

        created: '2014-03-05T19:00:00', // Creation date
        modified: '2014-04-05T19:00:00' // Last modified date
    });