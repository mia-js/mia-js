/**
 * AuthService
 */

var Q = require('q')
    , _ = require('lodash')
    , CIDRCheck = require('range_check').in_range
    , MiaJs = require("mia-js-core")
    , Shared = MiaJs.Shared
    , Translator = MiaJs.GetTranslations
    , Logger = MiaJs.Logger
    , Utils = MiaJs.Utils
    , MemberHelpers = Utils.MemberHelpers
    , Encryption = Utils.Encryption
    , ObjectID = require('mongodb').ObjectID
    , SecretModel = Shared.models('generic-secret-model')
    , DeviceModel = Shared.models('generic-device-model');

function thisModule() {
    var self = this;

    self.identity = 'generic-deviceAndSessionAuth'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    //========================================
    // Device management
    //========================================

    /**
     * Creates a device with provided data
     * @param options - contains translator
     * @param deviceData
     * @param retryCount
     * @returns { promise containing new device id or error }
     */
    self.createDevice = function (options, deviceData, retryCount) {
        var deferred = Q.defer();

        options = options || {};
        var translator = options.translator || Translator.default;

        var device = new DeviceModel();
        device.setValuesAndInsert(deviceData, function (err, deviceDataCreated) {
            if (err) {
                if (err.code && err.code == '11000' && retryCount > 1) {
                    Logger('info', 'DeviceId already exists, retrying to generate one');
                    deferred.resolve(self.createDevice(options, deviceData, retryCount - 1));
                }
                else {
                    deferred.reject({
                        status: 400,
                        err: err
                    });
                }
            }
            else {
                if (deviceDataCreated[0] && deviceDataCreated[0].id) {
                    deferred.resolve(deviceDataCreated[0].id);
                }
                else {
                    deferred.reject({status: 500});
                }
            }
        });

        return deferred.promise;
    };

    /**
     * Updates a device with provided data
     * @param options - contains translator
     * @param id
     * @param deviceData
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise}
     */
    self.updateDevice = function (options, id, deviceData) {
        var deferred = Q.defer();

        options = options || {};
        var translator = options.translator || Translator.default;

        deviceData.id = id;
        deviceData.lastModified = new Date(Date.now());

        var device = new DeviceModel();
        device.setValuesAndUpdate({id: id}, {$set: deviceData}, {partial: true}, function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (data == 0) {
                    deferred.reject({
                        status: 400,
                        err: {
                            'code': 'DeviceIdDoesNotExist',
                            'msg': translator('generic-translations', 'DeviceIdDoesNotExist')
                        }
                    });
                }
                else {
                    deferred.resolve(id);
                }
            }
        });

        return deferred.promise;
    };

    //========================================
    // Session management
    //========================================

    /**
     * Queries a DB for an access key
     * @param options
     * @param secretId
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise}
     * @private
     */
    var _getSecretFromDb = function (options, secretId) {
        var deferred = Q.defer();

        options = options || {};
        var translator = options.translator || Translator.default;

        SecretModel.findOne({
                id: secretId
            },
            function (err, data) {
                if (err) {
                    deferred.reject({status: 500});
                } else if (data) {
                    deferred.resolve(data);
                }
                else {
                    deferred.reject({
                        status: 403,
                        err: {'code': 'AccessKeyInvalid', 'msg': translator('generic-translations', 'AccessKeyInvalid')}
                    });
                }
            }
        );

        return deferred.promise;
    };

    self.getSecretFromDb = _getSecretFromDb;

    /**
     * Validates device access rights for requesting a new session. Device sends a md5([secret{32}][deviceId])[secretId{32}] in order to validate it's access rights.
     * @param options - contains translator
     * @param accessKey - md5([secret{32}][deviceId])[secretId{32}]
     * @param deviceId - deviceId
     * @param group - group name
     * @returns { promise containing dataset for the device or error}
     */
    self.checkAccessKey = function (options, accessKey, deviceId, group) {
        options = options || {};
        var translator = options.translator || Translator.default;

        if (!accessKey) {
            return Q.reject({
                status: 401,
                err: {'code': 'AccessKeyIsEmpty', 'msg': translator('generic-translations', 'AccessKeyIsEmpty')}
            });
        }

        if (!deviceId || deviceId.length < 32) {
            return Q.reject({
                status: 400,
                err: {'code': 'DeviceIdInvalid', 'msg': translator('generic-translations', 'DeviceIdInvalid')}
            });
        }

        //Access key format: md5([secret{32}][deviceId])[secretId{32}]
        var hash = accessKey.substr(0, 32);
        var secretId = accessKey.substr(32, accessKey.length);

        if (hash.length != 32 || secretId.length != 32) {
            return Q.reject({
                status: 403,
                err: {'code': 'AccessKeyInvalid', 'msg': translator('generic-translations', 'AccessKeyInvalid')}
            });
        }

        return _getSecretFromDb(options, secretId).then(function (secretData) {
            var validHash = Encryption.md5(secretData.secret + deviceId);

            //Check if access key is allowed for this group
            if (secretData.groups) {
                if ((secretData.groups).indexOf(group.toLowerCase()) == -1) {
                    return Q.reject({
                        status: 403,
                        err: {
                            'code': 'AccessKeyInvalidGroup',
                            'msg': translator('generic-translations', 'AccessKeyInvalidGroup')
                        }
                    });
                }
            }

            //Valid key
            if (hash.toLowerCase() == validHash.toLowerCase()) {
                return Q.resolve(secretData);
            }
            else {
                Logger('info', 'Expected key: ' + validHash + secretId);
                return Q.reject({
                    status: 403,
                    err: {'code': 'AccessKeyInvalid', 'msg': translator('generic-translations', 'AccessKeyInvalid')}
                });
            }
        });
    };

    /**
     * Generates session id for a device
     * @param options - contains translator
     * @param deviceId
     * @param ip
     * @param groups
     * @param retryCount
     * @returns { promise containing new session id or error }
     */
    self.generateSessionId = function (options, deviceId, ip, groups, retryCount) {
        var deferred = Q.defer();

        options = options || {};
        var translator = options.translator || Translator.default;

        var device = new DeviceModel();
        var params = {
            'session.set': true,
            'session.cidr': [ip + '/32'],
            'session.groups': groups,
            lastModified: new Date(Date.now()),
            status: 'active'
        };

        device.setValuesAndUpdate({id: deviceId}, {$set: params}, {partial: true}, function (err, data) {
            if (err) {
                if (err.code && err.code == '11001' && retryCount > 1) {
                    Logger('info', 'SessionId already exists retrying to generate one');
                    deferred.resolve(self.generateSessionId(options, deviceId, ip, allowedAccessGroups, retryCount - 1));
                }
                else {
                    deferred.reject({
                        status: 400,
                        //TODO: ersetzen durch 503
                        err: err
                    });
                }
            }
            else {
                if (data == 1 && device.data && device.data['$set']['session.id']) {
                    deferred.resolve(device.data['$set']['session.id']);
                }
                else {
                    deferred.reject({
                        status: 403,
                        err: {
                            'code': 'DeviceIdInvalid',
                            'msg': translator('generic-translations', 'DeviceIdInvalidOrDoesNotExists')
                        }
                    });
                }
            }
        });

        return deferred.promise;
    };

    /**
     * Queries the device collection for the given session
     * @param options - contains translator
     * @param sessionId
     * @returns {promise containing device data or an error}
     * @private
     */
    var _checkIfSessionTokenKnown = function (options, sessionId) {
        var deferred = Q.defer();

        options = options || {};
        var translator = options.translator || Translator.default;

        // Check if session token is valid
        DeviceModel.findOne({
                'session.id': sessionId
            },
            function (err, deviceData) {
                if (err) {
                    //Error while requesting db
                    deferred.reject({status: 500});
                } else {
                    // Session token not found
                    if (deviceData === null) {
                        deferred.reject({
                            status: 403,
                            err: {
                                'code': 'SessionTokenNotValid',
                                'msg': translator('generic-translations', 'SessionTokenNotValid')
                            }
                        });
                    }
                    //Session token is present
                    else {
                        if (deviceData) {
                            deferred.resolve(deviceData);
                        }
                        else {
                            Logger('info', 'Error no id');
                            deferred.reject({
                                status: 403,
                                err: {
                                    'code': 'SessionTokenNotValid',
                                    'msg': translator('generic-translations', 'SessionTokenNotValid')
                                }
                            });
                        }
                    }
                }
            });

        return deferred.promise;
    };

    /**
     * Get device data
     * @param login
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise}
     * @private
     */
    var _getDeviceDataById = function (deviceId) {
        var deferred = Q.defer();

        DeviceModel.findOne({
                id: deviceId
            },
            function (err, deviceData) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(deviceData);
                }
            });

        return deferred.promise;
    };

    self.getDeviceDataById = _getDeviceDataById;

    /**
     * Applies rules to check if session token is valid for the device
     * @param options
     * @param deviceData
     * @param ip
     * @param group
     * @returns {promise containing device data or an error}
     * @private
     */
    var _checkIfSessionValid = function (options, deviceData, ip, group) {
        options = options || {};
        var translator = options.translator || Translator.default;

        if (_.isEmpty(deviceData)) {
            return Q.reject({status: 500});
        }

        //Check if the device is marked as active and is not disabled
        if (deviceData.status != 'active') {
            return Q.reject({
                status: 403,
                err: {'code': 'TemporaryDisabled', 'msg': translator('generic-translations', 'TemporaryDisabled')}
            });
        }

        //Check if group is allowed for the session. Group permission is set by used secret
        if (deviceData.session.groups) {
            if ((deviceData.session.groups).indexOf(group) == -1) {
                return Q.reject({
                    status: 403,
                    err: {
                        'code': 'SessionInvalidGroup',
                        'msg': translator('generic-translations', 'SessionInvalidGroup')
                    }
                });
            }
        }

        // Check if IP address is allowed
        if (deviceData.session && deviceData.session.cidr) {
            //Check CIDRs
            for (var thisCIDR in deviceData.session.cidr) {
                if (CIDRCheck(ip, deviceData.session.cidr[thisCIDR])) {
                    Logger('info', 'Grant access for device ' + deviceData.id);
                    return Q(deviceData);
                }
            }
        }

        return Q.reject({
            status: 403,
            err: {'code': 'IPNotAllowed', 'msg': translator('generic-translations', 'IPNotAllowed')}
        });
    };

    /**
     * Validates session token
     * @param options - contains translator
     * @param sessionId
     * @param ip
     * @param group
     * @returns {promise containing device data or an error}
     */
    self.validateSessionToken = function (options, sessionId, ip, group) {
        return _checkIfSessionTokenKnown(options, sessionId).then(function (deviceData) {
            return _checkIfSessionValid(options, deviceData, ip, group);
        });
    };

    return self;
};

module.exports = new thisModule();
