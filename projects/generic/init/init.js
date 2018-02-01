var _ = require('lodash');
var MiaJs = require('mia-js-core');
var Shared = MiaJs.Shared;
var Logger = MiaJs.Logger;

function thisModule() {

    var self = this;

    self.init = function () {
        // Check if database connection is available
        if (Shared.isDbConnectionAvailable() === true) {
            Logger.info("Initializing generic data");
            _generateSecretTokens();
            _startUpEnsureIndexes();
        }
    };

    var _generateSecretTokens = function () {
        var secretTokenList = [
            {
                id: '6ff870ad33a86982550543e2f92623c5',
                secret: '10f2bde9a138ef5aeed40812b0a1594b',
                groups: ['generic']
            }
        ];
        var secretToken = Shared.models('generic-secret-model');
        _.forEach(secretTokenList, function (token) {
                //Save or update secrets in db

                secretToken.insertOne(token).then(function (result) {
                    // New session token saved to db
                    Logger.info('Written secretId ' + token.id + ' to db.');
                }).fail(function (err) {
                    if (err.code != 11000) {
                        Logger.error('Error while writing initial data secrets to db');
                    }
                }).done();
            }
        );
    };

    var _startUpEnsureIndexes = function () {
        Logger.info("Going to check startup config for ensureIndexes cronjob");
        var env = Shared.config('environment');
        var MemberHelpers = MiaJs.Utils.MemberHelpers;
        var startUp = MemberHelpers.getPathPropertyValue(env, 'cronJobs.ensureIndexes.runOnStartup');
        if (startUp) {
            var cronJobExecutionModel = Shared.models('generic-cronJobExecutionModel');
            cronJobExecutionModel.findOneAndUpdate({
                typeName: 'generic-ensureIndexes'
            }, {$set: {'config.forceRun': true}})
                .then(result => {
                    if (result.ok !== 1) {
                        Logger.error('An error occurred while enabling startup run on generic-ensureIndexes cronjob', result);
                    }
                    Logger.info('Startup run on generic-ensureIndexes cronjob successfully enabled');
                })
                .catch(error => {
                    Logger.error('An error occurred while enabling startup run on generic-ensureIndexes cronjob', error);
                });
        } else {
            Logger.info('Cronjob generic-ensureIndexes is not configured to run on startup');
        }
    };

    return self;
}

module.exports = new thisModule();
