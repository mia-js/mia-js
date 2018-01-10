/**
 * Example of a cron job
 * Auto removing todo tasks 5min after set to done
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
    , Logger = MiaJs.Logger.tag('cron', 'demo')
    , Utils = MiaJs.Utils
    , CronJobs = MiaJs.CronJobs
    , BaseCronJob = CronJobs.BaseCronJob
    , Shared = MiaJs.Shared
    , ToDoModel = Shared.models('todos-model');

/**
 * Custom cron job
 */
module.exports = BaseCronJob.extend({},
    {
        disabled: false, // Enable /disable job definition
        time: { // Times are used as default timings. To change after first run see mongodb collection cronJobTypes
            hour: '0-23',
            minute: '0-59',
            second: '0-59/10',
            dayOfMonth: '0-31',
            dayOfWeek: '0-7', // (0 or 7 is Sun, or use names)
            month: '0-12',   // names are also allowed
            timezone: 'CET'
        },

        isPaused: false,
        servers: ['server1'], // Not working currently - ignore

        maxInstanceNumberTotal: 1,// Not working currently - ignore
        maxInstanceNumberPerServer: 1,// Not working currently - ignore

        identity: 'removeToDosMarkedAsDoneCron', // Job name

        worker: function () {
            Logger.info("Start clean cronjob, see crons");

            var maxAge = new Date(Date.now() - (5 * 60 * 1000)); // older than 5 minutes

            return ToDoModel.deleteMany(
                {
                    'lastModified': {$lte: maxAge}
                },
                {validate: false}).then(function (data) {
                    var deletedCount = data.deletedCount || 0;
                    if (deletedCount > 0) {
                        Logger.info(deletedCount + ' todos auto removed');
                    }
                }).fail(function (err) {
                    Logger.error(err);
                });
        },

        created: '2015-07-14T12:00:00', // Creation date
        modified: '2015-07-14T12:00:00' // Last modified date
    }
);
