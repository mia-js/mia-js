/**
 * Custom logging function like console.log
 */

var _ = require('lodash');
var Async = require('async');
var Shared = require('mia-js-core/lib/shared');
var Logger = require('mia-js-core/lib/logger').tag('demo');
var DeviceModel = Shared.models('generic-device-model');

function thisModule() {

    var self = this;

    self.init = function () {
        //Add some initial tasks here i.e. db init data

        //Remove this for your project
        _generateSecretTokens();
        _generateDefaultDeviceProfile();

        // Use key: 9cd43d5622a2fa78b67b3412a2d8c614 for protected api demo

    };

    var _generateSecretTokens = function () {

        var secretTokenList = [
                {
                    id: '91205b43c5144068ee9979b093925f77',
                    secret: '74168c7a1868ddeee3355fab9489914b',
                    groups: ['demo']
                }
            ]
            , secretToken = Shared.models("generic-secret-model");

        _.forEach(secretTokenList, function (token) {
                //Save or update secrets in db
                secretToken.insertOne(token).then(function (result) {
                    // New session token saved to db
                    Logger.info('Written secretId ' + token.id + ' to db.');
                }).fail(function (err) {
                    if (err.code != 11000) {
                        Logger.error('Error while writing initial data secrets to db');
                    }
                });
            }
        );
    };

    var _generateDefaultDeviceProfile = function () {
        var staticAccessKey = "9cd43d5622a2fa78b67b3412a2d8c614";
        var addDevice = {
            session: {
                'cidr': ['0.0.0.0/0'],
                'expireable': false
            },
            'lastModified': Date.now(),
            'status': 'active',
            'access': {
                'key': staticAccessKey,
                'cidr': ['0.0.0.0/0'],
                'expires': null
                //'groups': ["1mainstream"]
            }
        };

        return DeviceModel.findOne({'access.key': staticAccessKey}).then(function (deviceData) {
            if (deviceData != null) {
                //admin session exists
                Logger.info("User with static key " + staticAccessKey + " already exists!");
            }
            else {
                return DeviceModel.validate(addDevice).then(function (validatedData) {
                    validatedData.session.id = addDevice.session.id;
                    return DeviceModel.insertOne(validatedData).then(function (data) {
                        Logger.info("A user with session id " + addDevice.session.id + " added!");
                    })
                });
            }
        }).fail(function (err) {
            Logger.error(err);
        });
    };

    return self;
};

module.exports = new thisModule();