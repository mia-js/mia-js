/**
 * Custom logging function like console.log
 */

var _ = require('lodash');
var Async = require('async');
var Shared = require('mia-js-core/node_modules/shared');
var Logger = require('mia-js-core/node_modules/logger');
var DeviceModel = Shared.models('generic-device-model');

function thisModule() {

    var self = this;

    self.init = function () {
        console.log("Initializing generic data");
        _generateSecretTokens();
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
                secretToken.insert(
                    token,
                    function (err, data) {
                        if (err) {
                            if (err.code != 11000) {
                                Logger('err', 'Error while writing initial data secrets to db');
                            }
                        }
                        else {
                            // New session token saved to db
                            Logger('info', 'Written secretId ' + token.id + ' to db.');
                        }
                    }
                );
            }
        );
    };

    return self;
}

module.exports = new thisModule();