/**
 * AuthService
 */

//<editor-fold desc="=== Requires ===">
var Q = require('q')
    , _ = require('lodash')
    , MiaJs = require("mia-js-core")
    , ObjectID = require('mia-js-core/lib/dbAdapters').MongoObjectID
    , Shared = MiaJs.Shared
    , Translator = MiaJs.GetTranslations
    , Logger = MiaJs.Logger
    , Utils = MiaJs.Utils
    , MemberHelpers = Utils.MemberHelpers
    , Encryption = Utils.Encryption
    , Qext = Utils.Qext
    , UserModel = Shared.models('generic-user-model')
    , UserProfileModel = Shared.models('generic-userProfile-model')
    , DeviceModel = Shared.models('generic-device-model');
//</editor-fold>

Q.stopUnhandledRejectionTracking();

function thisModule() {
    var self = this;

    self.identity = 'generic-userAuthManager'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    //<editor-fold desc="=== Querying user data and user's login state : OK ===">
    self.getUserDataById = function (userId) {
        if (_.isString(userId)) {
            userId = new ObjectID(userId);
        }

        return UserModel.findOne({
            _id: userId
        });
    };

    self.getDevicesUserIsLoggedInOn = function (userData) {
        if (!userData || !_.isArray(userData.accessTokens)) {
            return Q([]);
        }
        else {
            return Q(userData.accessTokens.map(function (value) {
                var deiviceId = MemberHelpers.getPathPropertyValue(value, 'device.id');
                return deiviceId ? deiviceId : false;
            }).filter(Boolean));
        }
    };

    self.getUserDataByEmailAndGroup = function (email, group) {
        return UserModel.findOne({
            messaging: {
                $elemMatch: {
                    type: "email",
                    'value': email
                }
            },
            group: group
        });
    };

    self.getDevicesUserIsLoggedInOnByUserId = function (userId) {
        return self.getUserDataById(userId).then(self.getDevicesUserIsLoggedInOn);
    };

    var _isUserLoggedInOnDeviceById = function (userId, deviceId, appId) {
        return UserModel.findOne({
            _id: userId,
            status: 'active',
            accessTokens: {
                $elemMatch: {
                    appId: appId,
                    'device.id': deviceId
                }
            }
        });
    };

    self.isUserLoggedInOnDeviceByLoginAndGroup = function (login, group, deviceId, appId) {
        return UserModel.findOne({
            login: login,
            group: group,
            status: 'active',
            nativeLoginIsSet: true,
            accessTokens: {
                $elemMatch: {
                    appId: appId,
                    'device.id': deviceId
                }
            }
        });
    };

    self.getUserLoggedInOnDevice = function (deviceId, appId) {
        return UserModel.findOne({
            status: 'active',
            accessTokens: {
                $elemMatch: {
                    appId: appId,
                    'device.id': deviceId
                }
            }
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Logout : OK ===">
    var _logoutUserFromAllDevices = function (userId) {
        return _updateUserData({
            _id: userId
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$set': {
                accessTokens: [],
                deviceCounts: []
            }
        });
    };

    self.logoutAnyUserFromDevice = function (deviceId, appId) {
        return _logoutUserFromDevice(undefined, deviceId, appId);
    };

    self.logoutUserFromDevice = function (userId, deviceId, appId) {
        return _logoutUserFromDevice(userId, deviceId, appId);
    };

    var _logoutUserFromDevice = function (userId, deviceId, appId) {
        var query = {};
        if (userId) {
            query._id = userId;
        }
        query['accessTokens'] = {
            $elemMatch: {
                appId: appId,
                'device.id': deviceId
            }
        };
        query['deviceCounts.appId'] = appId;

        return _updateUserData(query, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$pull': {
                accessTokens: {
                    appId: appId,
                    'device.id': deviceId
                }
            },
            '$inc': {
                'deviceCounts.$.deviceCount': -1
            }
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Update profile data : OK ===">
    var _incETag = function () {
        return Encryption.md5(Encryption.randHash());
    };

    var _createEtag = function (userId) {
        return _updateUserData({
            _id: userId,
            'status': 'active',
            etag: {$exists: false}
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$set': {
                etag: _incETag()
            }
        });
    };

    /**
     * Set profile section based on provided model and profile data
     * @param params :: {{
     *      appId: String,
     *      userProfileModel: {},  // if provided, used for validation of userProfileData
     *      userProfileData: {}   // if provided, will be set to corresponding profile section contained in appId
     * }}
     * @param options :: {{
     *      setCreatedAt: Boolean // set created date
     * }}
     * @returns Updated params, containing validated profile section
     * @private
     */
    self.processProfileData = function (params) {
        // prepare user profile data
        params = _.clone(params);

        return Q().then(function () {
            if (_.isUndefined(params.userProfileData) || _.isEmpty(params.userProfileData)) {
                //No validation needed because there is no data
                return Q({});
            }
            if (_.isObject(params.userProfileModel) && params.userProfileModel != UserProfileModel) {
                //Use custom model
                params.userProfileData = params.userProfileData || {};
                return params.userProfileModel.validate(params.userProfileData).fail(function (err) {
                    return Q.reject({status: 400, err: err});
                });
            }
            else if (!_.isObject(params.userProfileModel) && !_.isObject(params.userProfileData)) {
                //use default model and ignore provided userProfileData if any, since it can't be validated with default model
                var now = new Date(Date.now());
                params.userProfileModel = UserProfileModel;
                params.userProfileData = {
                    updatedAt: now
                };
                if (params.options && params.options.setCreatedAt === true) {
                    params.userProfileData.createdAt = now;
                }
                return UserProfileModel.validate(params.userProfileData).fail(function (err) {
                    return Q.reject({status: 400, err: err});
                });
            }
            else if (params.userProfileModel == 'doNotValidate') {
                //do not validate anything, since no model is provided
                return Q(params.userProfileData);
            }
            else {
                return Q.reject('Model expected!');
            }
        }).then(function (values) {
            params.userProfileData = {};
            if (params.appId) {
                params.userProfileData[params.appId] = values;
            }
            return Q(params);
        });
    };

    var _beforeProfileUpdate = function (params) {
        var options = params.options || {};
        var translator = options.translator || Translator.default;

        //Check if login has changed and already exists in other account

        if (!_.isEmpty(params.login) && params.login != params.userData.login) {
            return UserModel.findOne({
                login: params.login,
                group: params.group
            }).then(function (userData) {
                if (!userData) {
                    params.login = params.login || params.userData.login;
                    return Q(params);
                }
                else {
                    //provided login is already in use
                    return Q.reject({
                        status: 401,
                        err: {
                            'code': 'LoginAlreadyExists',
                            'msg': translator('generic-translations', 'LoginAlreadyExists')
                        }
                    });
                }
            });
        }
        else {
            params.login = params.userData.login;
            return Q(params);
        }

        /*if (_.isEmpty(params.password) && !_.isEmpty(params.login)) {
         return Q.reject({
         status: 400,
         err: {
         'code': 'WrongOrMissingRequestParameter',
         'msg': translator('generic-translations', 'WrongOrMissingRequestParameter') + ': password'
         }
         });
         }
         else if (!_.isEmpty(params.password)) {*/
        // params.login = params.login || params.userData.login;
        //}
        //return Q(params);
    };

    /**
     * Updates user data
     * @param params :: {
     *      userData: existing user data,
     *      group: String,
     *      login: String,
     *      email: String,  //provided email overwrites old email if different
     *      appId: String
     *      nativeLoginIsSet: Boolean,
     *      userProfileModel: {},  // if provided used for validation of userProfileData
     *      userProfileData: {},   // if provided will be set to corresponding profile section contained in appId
     *      thirdPartyTokens: {add: [], remove: {}}, //removing array is not yet supported due to mongo syntax
     *      options: {},
     *      inspectTokens: {
     *          invalidateToken: {
     *              generate: Boolean,
     *              unset: Boolean
     *          },
     *          passwordResetToken: {
     *              generate: Boolean,
     *              unset: Boolean
     *          }
     *      }
     * }
     * @returns {*}
     * @private
     */
    self.updateUserProfileData = function (params) {
        params = _.clone(params);
        params.options = params.options || {};
        params.options.setCreatedAt = false;
        return _beforeProfileUpdate(params).then(function (params) {
            return self.processProfileData(params);
        }).then(function (params) {
            return _updateUserProfileDataCore(params);
        });
    };

    /**
     * Updates user data
     * @param params :: {
     *      userData: existing user data,
     *      group: String,
     *      login: String,
     *      email: String,  //provided email overwrites old email if different
     *      nativeLoginIsSet: Boolean,
     *      userProfileData: {},
     *      thirdPartyTokensUpdate: {add: [{}], remove: {}}, //removing single token only, removing array is not yet supported due to mongo syntax
     *      options: {},
     *      inspectTokens: {
     *          invalidateToken: {
     *              generate: Boolean,
     *              unset: Boolean
     *          },
     *          passwordResetToken: {
     *              generate: Boolean,
     *              unset: Boolean
     *          }
     *      }
     * }
     * @param options
     * @returns {*}
     * @private
     */
    var _updateUserProfileDataCore = function (params) {
        var userData = params.userData;
        var options = params.options || {};
        var isEmailValidated = MemberHelpers.getPathPropertyValue(params.options, 'isEmailValidated');

        var queryObject;
        if (options.ignoreEtag === true) {
            queryObject = {
                _id: userData._id,
                'status': 'active'
            };
        }
        else {
            var etagCondition;
            if (params.etag) {
                etagCondition = {
                    $or: [{etag: params.etag}, {etag: {$exists: false}}]
                };
            }
            else {
                etagCondition = {
                    etag: {$exists: false}
                };
            }
            queryObject = {
                $and: [
                    {
                        _id: userData._id,
                        'status': 'active'
                    },
                    etagCondition
                ]
            };
        }

        var updateDocRemoveEntry = {};
        var queryObjectRemoveEntry = {
            _id: userData._id,
            'status': 'active'
        };

        //convert profile data to dot notation
        var updateDoc = {$set: MemberHelpers.dotize(params.userProfileData, 'profile')};
        updateDoc['$set'].etag = _incETag();

        return Q().then(function () {
            if (params.nativeLoginIsSet != null) {
                updateDoc['$set'].nativeLoginIsSet = params.nativeLoginIsSet;
            }

            //set login and password to be updated if provided
            if (!_.isEmpty(params.login) && params.login != userData.login) {
                /*if (_.isEmpty(params.password)) {
                 //on login change, password needs to be changed as well
                 return Q.reject({
                 status: 400,
                 err: {
                 'code': 'OnLoginChangePasswordNeedsToBeChangedAsWell',
                 'msg': 'On login change password needs to be changed as well'
                 }
                 });
                 }*/
                updateDoc['$set'].login = params.login;
            }

            if (!_.isEmpty(params.password)) {
                var group = params.group || userData.group;
                if (!group) {
                    return Q.reject({
                        err: {
                            'msg': 'Empty group is not allowed'
                        }
                    });
                }

                self.hashCredentials(group, params.password, params.options).then(function (passHash) {
                    updateDoc['$set'].passHash = passHash;
                });
            }

            var usersEmail = self.getUsersEmail(userData);
            var usersEmailValue = usersEmail.value;
            if (!_.isEmpty(params.email) && usersEmailValue != params.email) {
                if (!_.isEmpty(usersEmailValue)) {
                    updateDocRemoveEntry['$pull'] = {messaging: {value: usersEmailValue}};
                }
                updateDoc['$push'] = {messaging: _generateEmailMessagingEntry(params.email, isEmailValidated)};
            }

            if (params.thirdPartyTokensUpdate) {
                //check if the email is already contained
                if (params.thirdPartyTokensUpdate.add) {
                    if (_.isArray(params.thirdPartyTokensUpdate.add)) {
                        updateDoc['$push'] = {thirdParty: {$each: params.thirdPartyTokensUpdate.add}};
                    } else if (_.isObject(params.thirdPartyTokensUpdate.add)) {
                        updateDoc['$push'] = {thirdParty: params.thirdPartyTokensUpdate.add};
                    }
                }
                if (_.isObject(params.thirdPartyTokensUpdate.remove)) {
                    updateDoc['$pull'] = {thirdParty: params.thirdPartyTokensUpdate.remove};
                }
            }

            if (params.inspectTokens) {
                if (params.inspectTokens.invalidateToken) {
                    if (params.inspectTokens.invalidateToken.generate === true) {
                        updateDoc['$set']['inspectTokens.invalidateToken.token'] = _generateInvalidationToken();
                        updateDoc['$set']['inspectTokens.invalidateToken.tokenIssueDate'] = new Date(Date.now());
                    }
                    else if (params.inspectTokens.invalidateToken.unset === true) {
                        updateDoc['$unset'] = {'inspectTokens.invalidateToken': 1};
                    }
                }

                if (params.inspectTokens.passwordResetToken) {
                    if (params.inspectTokens.passwordResetToken.generate === true) {
                        updateDoc['$set']['inspectTokens.passwordResetToken.token'] = _generatePasswordResetToken();
                        updateDoc['$set']['inspectTokens.passwordResetToken.tokenIssueDate'] = new Date(Date.now());
                    }
                    else if (params.inspectTokens.passwordResetToken.unset === true) {
                        updateDoc['$unset'] = {'inspectTokens.passwordResetToken': 1};
                    }
                }
            }
            return Q();
        }).then(function () {
            return _updateUserData(queryObject, {
                partial: true,
                upsert: false,
                returnOriginal: false
            }, updateDoc).then(function (result) {
                //Remove old entry from messaging as this can not be done in one query
                if (!_.isEmpty(updateDocRemoveEntry) && result != null) {
                    return _updateUserData(queryObjectRemoveEntry, {
                        partial: true,
                        upsert: false,
                        returnOriginal: false
                    }, updateDocRemoveEntry);
                }
                else {
                    return Q(result);
                }
            });
        });
    };

    self.getUserDataEnsuringEtag = function (userId) {
        return self.getUserDataById(userId).then(function (userData) {
            if (!userData.etag) {
                //try to update etag
                return _createEtag(userId).then(function (userData) {
                    if (!userData) {
                        //user data might be empty here to some concurrent update taking place
                        return self.getUserDataById(userId).then(function (userData) {
                            if (!userData.etag) {
                                return Q.reject({status: 500});
                            }
                            else {
                                return Q(userData);
                            }
                        });
                    }
                    else {
                        return Q(userData);
                    }
                });
            }
            else {
                return Q(userData);
            }
        });
    };

    /**
     * Does an arbitrarily update on a user document.
     * @param updateDoc
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise}
     * @private
     */
    var _updateUserData = function (query, options, updateDoc) {
        return UserModel.findOneAndUpdate(query, updateDoc, options).then(function (data) {
            return data.value;
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Checking user credentials : OK ===">
    /**
     * Hashes user's credentials
     * @param login
     * @param password
     * @param options - must contain options.salt
     * @returns {promise containing
     * - password hash
     * - OR error}
     * @private
     */
    self.hashCredentials = function (group, password, options) {
        options = options || {};
        var salt = options.salt || '678fdf574c62f98f4b4214c39b3ec08d';

        return Q.fcall(function () {
            var hash = Encryption.md5(password + salt + group);
            return Q(hash);
        });
    };

    /**
     * Validates user's credentials and returns user data on success
     * @param login
     * @param password
     * @param options
     * @returns {promise containing
     * - user data
     * - OR null, if user is not found or wrong password provided
     * - OR error}
     * @private
     */
    var _checkUsersCredentials = function (login, group, password, options) {
        return self.hashCredentials(group, password, options).then(function (passHash) {
            return UserModel.findOne({
                $or: [
                    {
                        login: login
                    },
                    {
                        messaging: {
                            $elemMatch: {
                                type: 'email',
                                value: login
                            }
                        }
                    }
                ],
                group: group,
                passHash: passHash,
                status: 'active',
                nativeLoginIsSet: true
            });
        });
    };
    self.checkUsersCredentials = _checkUsersCredentials;
    //</editor-fold>

    //<editor-fold desc="=== Generating output for response : OK ===">
    self.getUsersEmail = function (userData) {
        if (_.isArray(userData.messaging)) {
            var email;
            userData.messaging.some(function (entry) {
                if (entry.type == 'email' && entry.value) {
                    email = {
                        value: entry.value,
                        validated: entry.validated
                    };
                    return true;
                }
            });
            return email;
        }
    };

    self.getUserAccountResponse = function (userData, appId) {
        var userProfile = {};
        if (userData) {
            if (userData._id) {
                userProfile.userId = userData._id;
            }
            if (userData.login && userData.nativeLoginIsSet) {
                userProfile.login = userData.login;
            }
            var email = self.getUsersEmail(userData);
            if (email) {
                userProfile.email = email;
            }
            if (userData.profile && userData.profile[appId]) {
                userProfile.profile = userData.profile[appId];
            }
        }
        return userProfile;
    };
    //</editor-fold>

    //<editor-fold desc="=== Generate/register device tokens : OK ===">
    /**
     * Registers new device by user document. Selects and updates user document with provided userId, checking following contraints:
     * - device should not be yet registered by the user document
     * - maxDeviceCount shouldn't be exceeded
     * @param userId
     * @param accessToken
     * @param maxDeviceCount
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise}
     * @private
     */
    var _registerAccessTokenCheckingMaxDevices = function (userId, accessToken, maxDeviceCount) {
        //add deviceCounts array entry if it doesn't yet exist
        return _updateUserData({
            _id: userId,
            deviceCounts: {
                $not: {
                    $elemMatch: {
                        appId: accessToken.appId
                    }
                }
            }
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$push': {
                deviceCounts: {
                    appId: accessToken.appId,
                    deviceCount: 0
                }
            }
        }).then(function () {
            //the deviceCounts now contains a deviceCount item
            return _updateUserData({
                _id: userId,
                accessTokens: {
                    $not: {
                        $elemMatch: {
                            appId: accessToken.appId,
                            'device.id': accessToken.device.id
                        }
                    }
                },
                deviceCounts: {
                    $elemMatch: {
                        appId: accessToken.appId,
                        deviceCount: {$lt: maxDeviceCount}
                    }
                }
            }, {
                partial: true,
                upsert: false,
                returnOriginal: false
            }, {
                '$push': {
                    accessTokens: accessToken
                },
                '$inc': {
                    'deviceCounts.$.deviceCount': 1
                }
            });
        });
    };
    self._registerAccessTokenCheckingMaxDevices = _registerAccessTokenCheckingMaxDevices;

    var _logoutOldestDevice = function (userId, accessTokens, appId) {
        //get all devices
        var query = {};
        query.$or = accessTokens.map(function (accessToken) {
            return {'id': accessToken.device.id};
        });

        return DeviceModel.find(query, {sort: {lastModified: 1}, limit: 1}).then(function (cursor) {
            return Qext.callNodeFunc({obj: cursor, func: cursor.toArray}).then(function (devices) {
                if (devices && devices.length > 0) {
                    return self.logoutUserFromDevice(userId, devices[0].id, appId).then(function () {
                        return Q();
                    });
                }
                else {
                    return Q();
                }
            });
        });
    };

    var _assertMaxDeviceCount = function (userData, appId, accessToken, maxDeviceCount, translator) {
        var translator = translator || Translator.default;

        var accessTokens = userData.accessTokens;
        var filteredAccessTokens = accessTokens.filter(function (value) {
            return value.appId == appId;
        });

        var userId = userData._id;
        if (filteredAccessTokens.length > maxDeviceCount - 1) {
            return _logoutOldestDevice(userId, filteredAccessTokens, appId).then(function () {
                return _registerAccessTokenCheckingMaxDevices(userId, accessToken, maxDeviceCount).then(function (userData) {
                    if (userData) {
                        return Q(userData);
                    }
                    else {
                        return Q.reject('Cannot register a new token for your user. You might want to try again later.');
                    }
                });
            });

            //==========
            //if max number of devices exceeded ==> return error 403 with the list of devices
            //Returning the list of devices for the user to check which one to take down
            //var accessTokensListForResponse = [];
            //filteredAccessTokens.forEach(function (accessToken) {
            //    accessTokensListForResponse.push({
            //        deviceName: accessToken.device.name,
            //        deviceId: accessToken.device.id,
            //        tokenIssueDate: accessToken.tokenIssueDate
            //    });
            //});
            //
            //return Q.reject({
            //    status: 403,
            //    err: {
            //        'code': 'MaxDeviceNumberExceeded',
            //        'msg': translator('generic-translations', 'MaxDeviceNumberExceeded'),
            //        currentDeviceList: accessTokensListForResponse
            //    }
            //});
        }
        else {
            return Q.reject('Cannot register a new token for your user. You might want to try again later.');
        }
    };

    /**
     * Generates new access token for the provided device
     * @param accessTokens
     * @param deviceId
     * @param deviceName
     * @param options
     * @returns token
     * @private
     */
    var _generateNewAccessToken = function (deviceId, appId, deviceName) {
        return {
            token: Encryption.randHash(),
            appId: appId,
            device: {
                id: deviceId,
                name: deviceName
            },
            tokenIssueDate: new Date(Date.now())
        };
    };
    //</editor-fold>

    //<editor-fold desc="=== Account creation/deletion : OK ===">
    var _generateEmailMessagingEntry = function (email, isValidated) {
        return {
            type: 'email',
            value: email,
            validated: isValidated === true,
            inspectTokens: {
                validateToken: {
                    token: _generateValidationToken(),
                    tokenIssueDate: new Date(Date.now())
                }
            }
        };
    };

    var _generateMessagingSection = function (email, isValidated) {
        if (email) {
            return [_generateEmailMessagingEntry(email, isValidated)];
        }
        else {
            return [];
        }
    };

    /**
     * Creates new user account
     * @param params :: {{
     *      group: String,
     *      login: String,
     *      email: String,
     *      passHash: String,
     *      nativeLoginIsSet: Boolean,
     *      userProfileData: {},
     *      thirdPartyTokens: Array
     * }}
     * @param options
     * @returns {*}
     * @private
     */
    var _createNewUserAccount = function (params) {
        var now = new Date(Date.now());
        var isEmailValidated = MemberHelpers.getPathPropertyValue(params.options, 'isEmailValidated') === true;
        return UserModel.validate({
            group: params.group,
            login: params.login,
            status: 'active',
            nativeLoginIsSet: params.nativeLoginIsSet,
            passHash: params.passHash,
            etag: _incETag(),
            inspectTokens: {
                invalidateToken: {
                    token: _generateInvalidationToken(),
                    tokenIssueDate: now
                }
            },
            messaging: _generateMessagingSection(params.email, isEmailValidated),
            accessTokens: [],
            deviceCounts: [],
            thirdParty: params.thirdPartyTokens || [],
            validated: isEmailValidated || false
        }).then(function (validatedData) {
            validatedData.profile = params.userProfileData || {};
            return UserModel.insertOne(validatedData);
        }).then(function (data) {
            var userData = data.ops;
            if (_.isArray(userData)) {
                return userData[0];
            }
            else {
                return userData;
            }
        });
    };

    /**
     * Restores deleted user account
     * @param params :: {{
     *      userId: String,
     *      email: String,
     *      passHash: String,
     *      nativeLoginIsSet: Boolean,
     *      userProfileData: {},
     *      thirdPartyTokens: Array
     * }}
     * @param options
     * @returns
     * @private
     */
    var _reinitializeUser = function (params) {
        var now = new Date(Date.now());
        var isEmailValidated = MemberHelpers.getPathPropertyValue(params.options, 'isEmailValidated');
        return _updateUserData({
            _id: params.userId,
            status: {
                $ne: 'active'
            }
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$set': {
                status: 'active',
                nativeLoginIsSet: params.nativeLoginIsSet,
                passHash: params.passHash,
                etag: _incETag(),
                profile: params.userProfileData || {},
                inspectTokens: {
                    invalidateToken: {
                        token: _generateInvalidationToken(),
                        tokenIssueDate: now
                    }
                },
                messaging: _generateMessagingSection(params.email, isEmailValidated),
                accessTokens: [],
                deviceCounts: [],
                thirdParty: params.thirdPartyTokens || [],
                validated: false
            }
        });
    };

    self.deleteUser = function (login, group) {
        return _updateUserData({
            $or: [
                {
                    login: login
                },
                {
                    messaging: {
                        $elemMatch: {
                            type: 'email',
                            value: login
                        }
                    }
                }
            ],
            group: group
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$set': {
                status: 'deleted',
                nativeLoginIsSet: false,
                accessTokens: [],
                deviceCounts: [],
                thirdParty: [],
                profile: {},
                inspectTokens: {}
            },
            $unset: {
                passHash: 1
            }
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Signup : OK ===">
    self.prepareDataForSignup = function (params) {
        if (_.isEmpty(params.group)) {
            return Q.reject({
                err: {
                    'code': 'InternalServerError',
                    'msg': 'Group cannot be empty'
                }
            });
        }

        params = _.clone(params);
        if (!params.login) {
            if (_.isEmpty(params.thirdPartyTokens)) {
                return Q.reject({
                    err: {
                        'code': 'InternalServerError',
                        'msg': 'Both empty login and empty thirdPartyTokens are not allowed'
                    }
                });
            }
            params.login = Encryption.randHash();
            params.password = Encryption.randHash();
            params.nativeLoginIsSet = false;
        }
        else {
            if (_.isEmpty(params.password)) {
                return Q.reject({
                    err: {
                        'code': 'InternalServerError',
                        'msg': 'Password cannot be empty if login is set'
                    }
                });
            }
        }

        return self.hashCredentials(params.group, params.password, params.options).then(function (passHash) {
            params.passHash = passHash;
            return Q(params);
        });
    };

    /**
     * Core signup logic  setting user profile. Creates user account with provided params. If the user exists returns error.
     * @param params :: {
     *      group: String,
     *      login: String,
     *      email: String,
     *      passHash: String,
     *      appId: String,
     *      nativeLoginIsSet: Boolean,
     *      userProfileModel: {},  // if provided used for validation of userProfileData
     *      userProfileData: {},   // if provided will be set to corresponding profile section contained in appId
     *      thirdPartyTokens: Array
     *      options : {}
     * }
     * @returns
     * @private
     */
    self.signUpUser = function (params) {
        params = _.clone(params);
        params.options = params.options || {};
        params.options.setCreatedAt = true;
        return self.processProfileData(params).then(function (params) {
            return _signUpUserCore(params);
        });
    };

    /**
     * Core signup logic
     * @param params :: {
     *      group: String,
     *      login: String,
     *      email: String,
     *      passHash: String,
     *      nativeLoginIsSet: Boolean,
     *      userProfileData: {},
     *      thirdPartyTokens: Array
     *      options : {}
     * }
     * @param options
     * @returns
     * @private
     */
    var _signUpUserCore = function (params) {
        var options = params.options || {};
        var translator = options.translator || Translator.default;

        if (_.isEmpty(params.group)
            || _.isEmpty(params.login)
            || _.isEmpty(params.passHash)
            || _.isEmpty(params.email)) {
            return Q.reject({
                err: {
                    'code': 'InternalServerError',
                    'msg': 'Error chaining controllers'
                }
            });
        }

        if (!params.email.match(/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)) {
            return Q.reject({
                status: 400,
                err: {
                    code: "InvalidEmailAddress",
                    msg: translator('generic-translations', 'InvalidEmailAddress')
                }
            });
        }

        return UserModel.findOne({
            $or: [
                {
                    login: params.login
                },
                {
                    messaging: {
                        $elemMatch: {
                            type: 'email',
                            value: params.email
                        }
                    }
                }
            ],
            group: params.group
        }).then(function (userData) {
            if (!userData) {
                //create new user
                return _createNewUserAccount(params);
            }
            else if (userData.status != 'active') {
                params.userId = userData._id;
                return _reinitializeUser(params);
            }
            else {
                //provided login is already in use
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'LoginAlreadyExists',
                        'msg': translator('generic-translations', 'LoginAlreadyExists')
                    }
                });
            }
        });
    };

    /**
     * Checks if user can be logged in with third party login with some existing account or creates a new account for the user
     * @param params :: {
     *      group: String,
     *      appId: String,
     *      userProfileModel: {},  // if provided used for validation of userProfileData
     *      userProfileDataOnCreate: {},   //profile data to be user on account creation
     *      userProfileDataOnUpdate: {},   //profile data to be used on account update
     *      options : {}
     * }
     * @returns {*}
     * @private
     */
    self.signupWithThirdPartyProvider = function (params) {
        params = _.clone(params);
        params.options = params.options || {};
        var translator = params.options.translator || Translator.default;
        var loginStatus = "created";

        //try to find an exiting user account with provided third party data
        return UserModel.findOne({
            group: params.group,
            'thirdParty.provider': params.thirdPartyLogin.provider,
            'thirdParty.id': params.thirdPartyLogin.id
        }).then(function (userData) {
            if (userData) {
                loginStatus = "exists";
                //user exists already, return this user
                return Q(userData);
            }
            else {
                //check if e-mail address is already known
                return UserModel.findOne({
                    messaging: {
                        $elemMatch: {
                            type: 'email',
                            value: params.email
                        }
                    },
                    group: params.group
                }).then(function (userData) {
                    if (!userData) {
                        //e-mail address is not known. Create new account
                        params.thirdPartyTokens = [{
                            provider: params.thirdPartyLogin.provider,
                            id: params.thirdPartyLogin.id
                        }];
                        params.userProfileData = params.onCreate.userProfileData;
                        return self.prepareDataForSignup(params).then(function (params) {
                            return _signUpUserCore(params);
                        });
                    }
                    else {
                        //this e-mail address is already registered
                        if (_isEmailValidated(userData, params.email)) {
                            //e-mail is validated, can merge accounts
                            loginStatus = "merged";
                            params.thirdPartyTokensUpdate = {
                                add: [{
                                    provider: params.thirdPartyLogin.provider,
                                    id: params.thirdPartyLogin.id
                                }]
                            };
                            params.userProfileData = params.onMerge.userProfileData;
                            params.userData = userData;
                            params.options.ignoreEtag = true;
                            return _updateUserProfileDataCore(params);
                        }
                        else {
                            //e-mail is not validated
                            return Q.reject({
                                status: 401,
                                err: {
                                    'code': 'EmailAddressIsNotValidated',
                                    'msg': translator('generic-translations', 'EmailAddressIsNotValidated')
                                }
                            });
                        }
                    }
                });
            }
        }).then(function (userData) {
            return Q({userData: userData, loginStatus: loginStatus});
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Account validation : OK ===">
    var _generateValidationToken = function () {
        return Encryption.randHash();
    };

    var _generateInvalidationToken = function () {
        return Encryption.randHash();
    };

    var _generatePasswordResetToken = function () {
        return Encryption.randHash();
    };

    var _isEmailValidated = function (userData, email) {
        if (!userData || !userData.messaging) {
            return false;
        }
        else {
            return userData.messaging.some(function (entry) {
                if (entry.type == 'email'
                    && entry.value == email
                    && entry.validated == true) {
                    return true;
                }
                else {
                    return false;
                }
            });
        }
    };

    self.validateUser = function (token) {
        if (token == null) {
            return Q.reject({
                err: {
                    'code': 'InternalServerError',
                    'msg': 'Empty token is not allowed'
                }
            });
        }
        else {
            return _updateUserData({
                'messaging.inspectTokens.validateToken.token': token
            }, {
                partial: true,
                upsert: false,
                returnOriginal: false
            }, {
                $set: {
                    'messaging.$.validated': true,
                    validated: true
                },
                $unset: {
                    'messaging.$.inspectTokens.validateToken.token': 1
                }
            });
        }
    };

    self.invalidateUser = function (token) {
        if (token == null) {
            return Q.reject({status: 500});
        }
        else {
            return _updateUserData({
                'inspectTokens.invalidateToken.token': token
            }, {
                partial: true,
                upsert: false,
                returnOriginal: false
            }, {
                $set: {
                    status: 'deleted',
                    accessTokens: [],
                    deviceCounts: [],
                    profile: {},
                    inspectTokens: {},
                    messaging: []
                },
                $unset: {
                    passHash: 1
                }
            });
        }
    };
    //</editor-fold>

    //<editor-fold desc="=== Password forgotten : OK ===">
    self.getPasswordResetToken = function (login, group) {
        return _updateUserData({
            $or: [
                {
                    login: login
                },
                {
                    messaging: {
                        $elemMatch: {
                            type: 'email',
                            value: login
                        }
                    }
                }
            ],
            group: group
        }, {
            partial: true,
            upsert: false,
            returnOriginal: false
        }, {
            '$set': {
                "inspectTokens.passwordResetToken.token": _generatePasswordResetToken(),
                "inspectTokens.passwordResetToken.tokenIssueDate": new Date(Date.now())
            }
        });
    };

    self.resetPassword = function (passwordResetToken, newPassword, options) {
        return UserModel.findOne({
            'inspectTokens.passwordResetToken.token': passwordResetToken
        }).then(function (userData) {
            if (userData) {
                var params = {
                    login: userData.login,
                    password: newPassword,
                    group: userData.group,
                    userData: userData,
                    options: options,
                    inspectTokens: {
                        passwordResetToken: {
                            unset: true
                        }
                    }
                };
                return self.updateUserProfileData(params);
            }
            else {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'WrongOrMissingRequestParameter',
                        'msg': 'Invalid token'
                    }
                });
            }
        });
    };
    //</editor-fold>

    //<editor-fold desc="=== Login : OK ===">
    /**
     * Login user using native credentials
     * @param params:: {
     *      deviceId: String,
     *      appId: String,
     *      deviceName: String,
     *      options: {},
     *      userData: {}
     * }
     * @returns {*}
     */
    self.loginUserCore = function (params) {
        //deviceId, appId, deviceName, options

        var options = params.options || {};
        var translator = options.translator || Translator.default;
        var maxDeviceCount = options.maxDeviceCount || 5;

        if (!params.userData) {
            //wrong credentials for an existing user OR provided user doesn't exist OR is inactivated
            // ==> log out any user (if any was logged in) from this device
            return self.logoutAnyUserFromDevice(params.deviceId, params.appId).then(function (userData) {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'InvalidCredentials',
                        'msg': translator('generic-translations', 'InvalidCredentials')
                    }
                });
            });
        }
        else {
            //correct credentials are provided
            var userId = params.userData._id;
            var cachedUserData = params.userData;
            return _isUserLoggedInOnDeviceById(params.userId, params.deviceId, params.appId).then(function (userData) {
                if (userData) {
                    //user is already logged in on device
                    return Q(userData);
                }
                else {
                    //user is not logged in on a device
                    return self.logoutAnyUserFromDevice(params.deviceId, params.appId).then(function (anotherUsersData) {
                        var newAccessToken = _generateNewAccessToken(params.deviceId, params.appId, params.deviceName);
                        return _registerAccessTokenCheckingMaxDevices(userId, newAccessToken, maxDeviceCount).then(function (userData) {
                            if (userData) {
                                return Q(userData);
                            }
                            else {
                                //new device token could not be registered, determine the cause
                                return _assertMaxDeviceCount(cachedUserData, params.appId, newAccessToken, maxDeviceCount, translator);
                            }
                        });
                    });
                }
            });
        }
    };

    /**
     * Login user using native credentials
     * @param params:: {
     *      login: String,
     *      group: String,
     *      password: String,
     *      options: {},
     *      deviceId: String,
     *      appId: String,
     *      deviceName: String
     * }
     * @returns {*}
     */
    self.loginUser = function (params) {
        //check user's credentials
        params = _.clone(params);
        return _checkUsersCredentials(params.login, params.group, params.password, params.options).then(function (userData) {
            params.userData = userData;
            return self.loginUserCore(params);
        });
    };
    //</editor-fold>

    return self;
};

module.exports = new thisModule();
