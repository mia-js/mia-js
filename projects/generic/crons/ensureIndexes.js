/**
 * Checks model indexes against currently existing ones in the database
 */

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

const _ = require('lodash');
const MiaJs = require('mia-js-core');
const Logger = MiaJs.Logger.tag('generic', 'cron', 'ensureIndexes');
const BaseCronJob = MiaJs.CronJobs.BaseCronJob;
const Shared = MiaJs.Shared;

let debug = false;
let envConfig;

/**
 * Finds index from array by name
 * @param {String} indexName
 * @param {Array} indexes
 * @returns {Object|undefined}
 * @private
 */
const _findIndexByName = (indexName, indexes) => {
    for (let i in indexes) {
        let index = indexes[i];
        if (index.name === indexName) return index;
    }
    return undefined;
};

/**
 * Creates all model indexes
 * @param {Object} model
 * @param {Array} modelIndexes
 * @param {Array} dbIndexes
 * @param {Array} modifiedIndexes
 * @returns {Promise}
 * @private
 */
const _ensureIndexes = (model, modelIndexes, dbIndexes, modifiedIndexes) => {
    return new Promise(resolve => {
        model.ensureAllIndexes(error => {
            if (error) {
                if (error.code === 85) {
                    // Index already exists with different options
                    Logger.warn(error.message + ' in model "' + model.identity + '"');

                    let splittedErrorMessage = error.errmsg.split(' '); //FIXME: Find better solution to get indexName than parsing error.message. Maybe with higher mongodb versions
                    let dbIndexName = splittedErrorMessage[3];
                    let modelIndex = _findIndexByName(dbIndexName, modelIndexes);

                    if (modelIndex) {
                        modifiedIndexes.push(modelIndex);

                        if (debug) {
                            let dbIndex = _findIndexByName(dbIndexName, dbIndexes);
                            Logger.debug('Database index:', dbIndex);
                            Logger.debug('Model index:', modelIndex);
                        }
                    }

                } else {
                    Logger.error('An error occurred while ensuring indexes for model "' + model.identity + '"', error);
                }
            } else {
                Logger.info('All indexes are existing for model "' + model.identity + '"');
            }
            return resolve();
        }, envConfig.useBackgroundMode);
    });
};

/**
 * Syncs db indexes with model indexes and removes them if necessary
 * @param {Object} model
 * @param {Array} modelIndexes
 * @param {Array} dbIndexes
 * @returns {Promise}
 * @private
 */
const _removeIndexes = (model, modelIndexes, dbIndexes) => {
    dbIndexes.forEach(async dbIndex => {
        let dbIndexName = dbIndex.name;
        if (dbIndexName === '_id_') {
            // Skip _id_ indexes
            return;
        }
        let modelIndex = _findIndexByName(dbIndexName, modelIndexes);
        if (!modelIndex) {
            Logger.info('Index "' + dbIndexName + '" on model "' + model.identity + '" is going to be removed');
            if (debug) {
                Logger.debug('Database index:', dbIndex);
                Logger.debug('Model index:', modelIndex);
            }
            let dropResult = await model.dropIndex(dbIndexName);
            if (dropResult.ok !== 1) {
                Logger.error('An error occurred while removing index "' + dbIndexName + '" on model "' + model.identity + '"', dropResult);
            }
            Logger.info('Index "' + dbIndexName + '" on model "' + model.identity + '" removed successfully');
        }
    });
    return Promise.resolve();
};

/**
 * Recreates modified indexes
 * @param {Object} model
 * @param {Array} modifiedIndexes
 * @returns {Promise}
 * @private
 */
const _recreateIndexes = (model, modifiedIndexes) => {
    if (!_.isEmpty(modifiedIndexes)) {
        let recreationPromises = [];
        Logger.info('Going to recreate modified indexes for model "' + model.identity + '"');
        modifiedIndexes.forEach(index => {
            recreationPromises.push(model.dropIndex(index.name)
                .then(() => {
                    return new Promise((resolve, reject) => {
                        model.ensureIndexes([index], envConfig.useBackgroundMode, error => {
                            if (error) return reject(error);
                            return resolve();
                        });
                    });
                })
                .then(() => {
                    Logger.info('Index "' + index.name + '" on model "' + model.identity + '" successfully recreated');
                })
                .catch(err => {
                    Logger.error('An error occurred while recreating index "' + index.name + '" on model "' + model.identity, err);
                })
            );
        });

        return Promise.all(recreationPromises)
            .then(() => {
                Logger.info('All modified indexes are processed for model "' + model.identity + '"');
            });
    }
    return Promise.resolve();
};

module.exports = BaseCronJob.extend({},
    {
        identity: 'generic-ensureIndexes', // Job name
        created: '2017-11-23T16:00:00', // Creation date
        modified: '2014-11-28T18:00:00', // Last modified date
        disabled: false, // Enable/disable job definition
        time: {
            hour: '3',
            minute: '0',
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

        /**
         * Cronjob main routine
         * @param {Object} self
         * @param {Object} actualConfig
         * @returns {Promise}
         */
        worker: async function (self, actualConfig) {
            const startDate = new Date();
            const env = Shared.config('environment');

            envConfig = env.cronJobs.ensureIndexes || {
                autoStart: false,
                runOnStartup: false,
                useBackgroundMode: true
            };

            debug = actualConfig.debugOutput;

            if (envConfig.autoStart || actualConfig.forceRun == true) {
                const models = Shared.models();
                let modelPromises = [];

                Logger.info('Start running...');

                if (envConfig.useBackgroundMode) {
                    Logger.info('New indexes will be created in background');
                } else {
                    Logger.warn('New indexes will be created in foreground, all other operations on the database will be blocked!');
                }

                for (let identity in models) {
                    let versions = models[identity];
                    for (let version in versions) {
                        let model = versions[version];
                        let modelIndexes = model.getIndexes();
                        let dbIndexes = [];
                        let modifiedIndexes = [];

                        dbIndexes = await model.indexes();

                        modelPromises.push(
                            /**
                             * Sync db indexes with model indexes and remove them if necessary
                             */
                            _removeIndexes(model, modelIndexes, dbIndexes)
                                .then(() => {
                                    return model.indexes()
                                        .then(dbIndexes => {
                                            /**
                                             * Ensure all model indexes (create new ones if necessary)
                                             */
                                            return _ensureIndexes(model, modelIndexes, dbIndexes, modifiedIndexes);
                                        })
                                        .then(() => {
                                            /**
                                             * Recreate modified indexes
                                             */
                                            return _recreateIndexes(model, modifiedIndexes);
                                        });
                                })
                        );
                    }
                }

                return Promise.all(modelPromises)
                    .then(() => {
                        Logger.info('Finished. Runtime: ' + (Math.abs(new Date() - startDate) / 1000) + ' seconds');
                    });
            } else {
                Logger.info('Deactivated for environment ' + env.identity);
            }
        }
    }
);
