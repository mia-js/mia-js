/**
 * generic-accessKeyService
 *
 * @module      :: Policy
 * @description :: Validates device access to retrieve a session key
 */

var _ = require('lodash')
    , MiaJs = require('mia-js-core')
    , Logger = require('mia-js-core').Logger
    , Shared = require('mia-js-core').Shared
    , AuthService = Shared.libs("generic-deviceAndSessionAuth");

function thisModule() {
    var self = this;

    self.identity = 'generic-accessKeyService'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.preconditions = {
        all: {
            parameters: {
                header: {
                    key: {
                        desc: "ApiKey",
                        type: String,
                        minLength: 64,
                        maxLength: 64,
                        required: true
                    }
                },
                path: {
                    id: {
                        desc: "Device Id",
                        type: String,
                        minLength: 32,
                        maxLength: 32,
                        required: true
                    }
                }
            },
            responses: {
                400: "DeviceIdInvalid",
                401: "AccessKeyIsEmpty",
                403: ["AccessKeyInvalid", "AccessKeyInvalidGroup"]
            }
        }
    };

    self.all = function (req, res, next) {
        var accessKey = req.header('key')
            , deviceId = req.params['id']
            , group = req.miajs.route.group
            , translator = req.miajs.translator;

        AuthService.checkAccessKey({translator: translator}, accessKey, deviceId, group).then(function (data) {
            Logger.debug('Access key is valid');

            //Set allowed groups (depending on secret)
            if (data.groups) {
                req.allowedAccessGroups = data.groups;
            }
            else {
                req.allowedAccessGroups = [req.miajs.route.group];
            }
            next();
        }).catch(function (err) {
            next(err);
        });
    };

    return self;
};

module.exports = new thisModule();
