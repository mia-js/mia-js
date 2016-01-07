/**
 * generic-accessKeyService
 *
 * @module      :: Authorization
 * @description :: Validates a given request signature (header field signature) and allows or denies access to next controller
 * The signature is a hash (default SHA256) of the following data:
 * signatur=[deviceId]+[secretId]+[timestamp]+HASH([deviceId] + [secret] + [timeStamp] + [requestMethod] + [baseUrl] + [urlPath] + HASH([bodyHash])).toLowerCase())
 *
 * Fields:
 * deviceId = Id of device, see device register service, length 32 char
 * secretId = Identifier of used secret, to allow different secrets with different projects/releases
 * timestamp = UTC time stamp of current time in seconds since 1.1.1970, 10 digits
 * requestMethod = Used request method defined by HTTP i.e. post, get, put, delete
 * baseUrl = Protocol and domain of request i.e. https://mia-js-core.sevenventures.com
 * urlPath = Path and Query Parameters of request UTF-8 encoded i.e. /api/v1/service?my=first&parameter=settings
 * bodyHash = Hash of plain JSON document of request. Default in SHA256
 *
 * Notice:
 * Query parameters must be encoded as UTF-8 to avoid hash conflicts on server side. Make sure that all data inside the hash is converted to lower case.
 * The timestamp is used to block requests that are older than a defined expire time. Make sure that the client has the correct UTF-8 time. If not the request will fail and returns the
 * current server date as header field "date". Uses this date to make a time correction client side and retry request with adjusted date time.
 *
 * It is also possible to use a different hash algorithm than SHA256. This can be set in header field "signatureMethod".
 * Currently this functionality is not implemented so default is SHA256.
 */

var _ = require('lodash')
    , MiaJs = require('mia-js-core')
    , Logger = MiaJs.Logger
    , Shared = require('mia-js-core').Shared
    , AuthService = Shared.libs("generic-deviceAndSessionAuth")
    , Crypto = require('crypto')
    , Url = require('url')
    , IP = require('ip')
    , Translator = MiaJs.GetTranslations
    , SecretModel = Shared.models('generic-secret-model')
    , DeviceModel = Shared.models('generic-device-model')
    , Q = require('q');

Q.stopUnhandledRejectionTracking();

function thisModule() {
    var self = this;

    self.identity = 'generic-validateAccessKey'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.preconditions = {
        all: {
            parameters: {
                header: {
                    key: {
                        desc: "Authorization access key",
                        type: String,
                        required: true
                    },
                    signaturemethod: {
                        desc: "Authorization access key signature method. Default SHA256 if not set",
                        allow: ["sha256"],
                        convert: "lower",
                        type: String
                    },
                    requestdate: {
                        desc: "Date string when client request was initiated i.e. 2015-01-01T00:00:00",
                        type: Date
                    }
                }
            },
            responses: {
                401: ["KeyInvalid", "KeyExpired", "DeviceIdInvalid"],
                403: ["KeyInvalidForGroup", "SignatureMethodInvalid", "TemporaryDisabled", "IPNotAllowed"]
            }
        }
    };

    /**
     * Check date of auth token
     * @param options
     * @param maxTokenValidTime
     * @param tokenTimestamp
     * @returns {*}
     * @private
     */
    var _checkValidTokenDate = function (options, maxTokenValidTime, tokenTimestamp) {
        var timeOffset = 0;
        var dateNow = new Date(Date.now());
        var tokenDate = new Date(tokenTimestamp * 1000);
        var translator = options.translator || Translator.default;
        if (tokenDate == "Invalid Date") {
            return Q.reject({
                status: 401,
                err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
            });
        }
        else {
            timeOffset = (tokenDate - dateNow) / 1000; //Timeoffset in seconds
            if (Math.abs(timeOffset) > maxTokenValidTime) {
                Logger.info("Timestamp in signature has expired");
                return Q.reject({
                    status: 401,
                    err: {'code': 'KeyExpired', 'msg': translator('generic-translations', 'KeyExpired')}
                });
            }
            else {
                return Q(Math.round(timeOffset));
            }
        }
    };


    /**
     * Generate expected auhtorization signature depending on give request data
     * HASH(deviceId + secret + timeStamp + requestMethod + baseUrl + urlPath + bodyHash).toLowerCase()
     * Default hash method sha256
     * @param req
     * @param deviceId
     * @param secret
     * @param timeStamp
     * @param signatureMethod
     * @returns {*}
     * @private
     */
    var _generateAuthorizedSignature = function (req, deviceId, secret, timeStamp, signatureMethod) {
        var requestMethod = req.method
            , protocol = req.header('X-Forwarded-Proto') || req.protocol
            , baseUrl = protocol.toLowerCase() + "://" + req.headers.host.toLowerCase()
        //, decoder = new StringDecoder('utf8')
            , bodyHash = req.rawBodyJSON ? Crypto.createHash(signatureMethod).update(req.rawBodyJSON.toLowerCase(), 'utf8').digest('hex') : ""
            , urlPath = req.url //decoder.write(new Buffer(decodeURI(req.url)))
            , hashString = (deviceId + secret + timeStamp + requestMethod + baseUrl + urlPath + bodyHash).toLowerCase(); // Append hash components
        return Crypto.createHash(signatureMethod).update(hashString, 'utf8').digest('hex');
    };


    /**
     * Get secret from db by secretID
     * @param options
     * @param secretId
     * @returns {promise.promise|jQuery.promise|d.promise|promise|Q.promise|jQuery.ready.promise|*}
     * @private
     */
    var _getSecretBySecretId = function (options, secretId) {
        var options = {};
        var translator = options.translator || Translator.default;

        if (_.isEmpty(secretId)) {
            return Q.reject();
        }

        return SecretModel.findOne({id: secretId}).then(function (data) {
            if (data) {
                return Q(data);
            }
            else {
                return Q.reject();
            }
        }).fail(function (err) {
            return Q.reject({
                status: 500
            });
        });
    };

    /**
     * Check if static access key is valid
     * @param options
     * @param accessKey
     * @returns {promise.promise|jQuery.promise|d.promise|promise|Q.promise|jQuery.ready.promise|*}
     * @private
     */
    var _checkAccessKey = function (options, accessKey) {
        options = options || {};
        var translator = options.translator || Translator.default;
        // Check if session token is valid

        return DeviceModel.findOne({'access.key': accessKey}).then(function (deviceData) {
            // Access key not found
            if (deviceData === null) {
                return Q.reject({
                    status: 401,
                    err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
                });
            }
            //Access key is valid
            else {
                if (deviceData) {
                    return Q(deviceData);
                }
                else {
                    return Q.reject({
                        status: 401,
                        err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
                    });
                }
            }
        }).fail(function (err) {
            return Q.reject(err);
        });

    };

    /**
     * Check contrains for static key i.e. ip match, group rights
     * @param options
     * @param deviceData
     * @param ip
     * @param group
     * @returns {*}
     * @private
     */
    var _checkAccessKeyAuthConstrains = function (options, deviceData, ip, group) {
        options = options || {};
        var translator = options.translator || Translator.default;
        if (_.isEmpty(deviceData)) {
            return Q.reject({
                status: 500
            });
        }

        //Check if the device is marked as active and is not disabled
        if (deviceData.status != 'active') {
            return Q.reject({
                status: 403,
                err: {'code': 'TemporaryDisabled', 'msg': translator('generic-translations', 'TemporaryDisabled')}
            });
        }

        //Check if group is allowed for the session. Group permission is set by used secret
        if (deviceData.access.groups) {
            if ((deviceData.access.groups).indexOf(group) == -1) {
                return Q.reject({
                    status: 403,
                    err: {'code': 'KeyInvalidForGroup', 'msg': translator('generic-translations', 'KeyInvalidForGroup')}
                });
            }
        }

        // Check if IP address is allowed
        if (deviceData.access && deviceData.access.cidr) {
            //Check CIDRs
            for (var thisCIDR in deviceData.access.cidr) {
                if (IP.cidrSubnet(deviceData.access.cidr[thisCIDR]).contains(ip)) {
                    // Update device lastModified to mark device as still in use. Only once in 24 hours
                    if (deviceData.lastModified < new Date(Date.now() - 60 * 60 * 24 * 1000)) {
                        AuthService.updateDevice(options, deviceData.id, {});
                    }
                    return Q.resolve(deviceData);
                }
            }
        }

        return Q.reject({
            status: 403,
            err: {'code': 'IPNotAllowed', 'msg': translator('generic-translations', 'IPNotAllowed')}
        });
    };


    /**
     * Get device data from db
     * @param options
     * @param deviceId
     * @returns {*|Parse.Promise}
     * @private
     */
    var _getDeviceData = function (options, deviceId) {
        options = options || {};
        var translator = options.translator || Translator.default;
        // Get device data from db and reject if device is disabled or does not exists
        return AuthService.getDeviceDataById(deviceId).then(function (deviceData) {
            if (_.isEmpty(deviceData)) {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'DeviceIdInvalid',
                        'msg': translator('generic-translations', 'DeviceIdInvalid')
                    }
                });
            }

            if (deviceData.status == "disabled") {
                return Q.reject({
                    status: 403,
                    err: {
                        'code': 'TemporaryDisabled',
                        'msg': translator('generic-translations', 'TemporaryDisabled')
                    }
                });
            }
            // Update device lastModified to mark device as still in use. Only once in 24 hours
            if (deviceData.lastModified < new Date(Date.now() - 60 * 60 * 24 * 1000) || deviceData.status == "inactive") {
                AuthService.updateDevice(options, deviceData.id, {"status": "active"});
            }
            return Q.resolve(deviceData);
        });
    };


    /**
     * Validate key based on signature hash
     * @param req
     * @returns {*}
     * @private
     */
    var _validateSignature = function (req) {
        var translator = req.miajs.translator
            , options = {translator: translator}
            , signatureToken = req.miajs.validatedParameters.header.key
            , signatureMethod = req.miajs.validatedParameters.header.signaturemethod || "sha256"
            , deviceId = signatureToken.substring(0, 32)
            , secretId = signatureToken.substring(32, 64)
            , signatureTimeStamp = signatureToken.substring(64, 74)
            , signature = signatureToken.substring(74, signatureToken.length)
            , group = req.miajs.route.group
            , maxTokenValidTime = 300; // Max time token is valid in seconds

        if (signatureMethod != "sha256") {
            Logger.info("Signature method not allowed");
            return Q.reject({
                status: 403,
                err: {
                    'code': 'SignatureMethodInvalid',
                    'msg': translator('generic-translations', 'SignatureMethodInvalid')
                }
            });
        }

        // Check deviceId
        if (_.isEmpty(deviceId) || deviceId.length < 32) {
            Logger.info("DeviceId is invalid length, given: " + deviceId);
            return Q.reject({
                status: 401,
                err: {'code': 'DeviceIdInvalid', 'msg': translator('generic-translations', 'DeviceIdInvalid')}
            });
        }

        //Check secretId
        if (_.isEmpty(secretId) || secretId.length < 32) {
            Logger.info("SecretId is invalid length, given: " + secret);
            return Q.reject({
                status: 401,
                err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
            });
        }

        //Check signatureTimeStamp is valid
        var signatureDate = new Date(signatureTimeStamp * 1000); // needs to be in milliseconds
        if (signatureDate == "Invalid Date") {
            Logger.info("Timestamp is invalid date, given: " + signatureTimeStamp);
            return Q.reject({
                status: 401,
                err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
            });
        }

        //Check signature timeStamp. Reject if timediff to now is > maxTokenValidTime (also if timestamp is in future)
        return _checkValidTokenDate(options, maxTokenValidTime, signatureTimeStamp).then(function (timeoffset) {

            //Get secret from db by secretId to generate signature hash
            return _getSecretBySecretId(options, secretId).then(function (secretData) {

                // Check if access is allowed with this secret for this group
                if (!secretData || !secretData.groups || !secretData.secret) {
                    return Q.reject({
                        status: 401,
                        err: {
                            'code': 'KeyInvalid',
                            'msg': translator('generic-translations', 'AuthTokenInvalid')
                        }
                    });
                }

                //Reject if secret used is not allowed to access this service group
                if ((secretData.groups).indexOf(group.toLowerCase()) == -1) {
                    return Q.reject({
                        status: 403,
                        err: {
                            'code': 'KeyInvalidForGroup',
                            'msg': translator('generic-translations', 'KeyInvalidForGroup')
                        }
                    });
                }

                //Check if secret is currently disabled
                if (secretData.enabled == false) {
                    return Q.reject({
                        status: 401,
                        err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
                    });
                }
                // Generate a signature that is excepted to match
                var authorizedSignature = _generateAuthorizedSignature(req, deviceId, secretData.secret, signatureTimeStamp, signatureMethod);

                // Check validity of given signature
                if (signature.toLowerCase() != authorizedSignature.toLowerCase()) {
                    Logger.info("DENIED: Expected Hash: " + authorizedSignature + ", Given: " + signature);
                    /*Logger.warn("DENIED: Expected Signature: " + deviceId + secretId + signatureTimeStamp + authorizedSignature);
                     Logger.warn("DENIED: Given Signature: " + signatureToken);*/
                    return Q.reject({
                        status: 401,
                        err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
                    });
                }
                return Q.resolve(deviceId);
            }).fail(function (err) {
                if (err) {
                    return Q.reject(err);
                }
                else {
                    return Q.reject({
                        status: 401,
                        err: {'code': 'KeyInvalid', 'msg': translator('generic-translations', 'KeyInvalid')}
                    });
                }
            });
        });
    };

    // Calculate timeoffset if header field requestdate is set
    var _clientTimeOffset = function (req) {
        var timeOffset = 0;
        var deviceDate = new Date(req.miajs.validatedParameters.header.requestdate);
        var dateNow = new Date(Date.now());
        if (deviceDate != "Invalid Date") {
            timeOffset = deviceDate - dateNow;// Return in milliseconds
        }
        return timeOffset;
    };

    /**
     * Validate AccessKey based on dynamic signature or static key
     * @param req
     * @param res
     * @param next
     */
    self.all = function (req, res, next) {
        var translator = req.miajs.translator
            , options = {translator: translator}
            , protocol = req.header('X-Forwarded-Proto') || req.protocol
            , key = req.miajs.validatedParameters.header.key;

        if (key.length == 32) {
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
                , group = req.miajs.route.group;

            // Validate static key token
            _checkAccessKey(options, key).then(function (deviceData) {
                return _checkAccessKeyAuthConstrains(options, deviceData, ip, group).then(function (deviceData) {
                    //Add timeoffset of client to deviceData to give next controller the possibility of time correction if needed
                    deviceData.timeOffset = _clientTimeOffset(req);
                    req.miajs.device = deviceData;
                    res.header("timestamp", Date.now());
                    next();
                });
            }).fail(function (err) {
                if (err.status == 401) {
                    res.setHeader('WWW-Authenticate', 'Token realm="' + protocol.toLowerCase() + "://" + req.headers.host.toLowerCase() + req.miajs.route.prefix + '"');
                }
                res.header("timestamp", Date.now());
                next(err);
            }).done();
        }
        else {
            // Validate dynamic signature hash token
            _validateSignature(req).then(function (deviceId) {
                return _getDeviceData(options, deviceId).then(function (deviceData) {
                    //Add timeoffset of client to deviceData to give next controller the possibility of time correction if needed
                    deviceData.timeOffset = _clientTimeOffset(req);
                    req.miajs.device = deviceData;
                    res.header("timestamp", Date.now());
                    next();
                });
            }).fail(function (err) {
                if (err.status == 401) {
                    res.setHeader('WWW-Authenticate', 'Token realm="' + protocol.toLowerCase() + "://" + req.headers.host.toLowerCase() + req.miajs.route.prefix + '"');
                }
                res.header("timestamp", Date.now());
                next(err);
            }).done();
        }
    };


    return self;
};

module.exports = new thisModule();
