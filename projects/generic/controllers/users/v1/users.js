var Q = require('q')
    , MiaJs = require('mia-js-core')
    , BaseModel = MiaJs.BaseModel
    , Request = MiaJs.Request
    , Logger = MiaJs.Logger
    , Shared = MiaJs.Shared
    , Translator = MiaJs.GetTranslations
    , AuthManager = Shared.libs("generic-userAuthManager")
    , Encryption = MiaJs.Utils.Encryption
    , MemberHelpers = MiaJs.Utils.MemberHelpers
    , _ = require('lodash')
    , UserProfileModel = Shared.models('generic-userProfile-model');

Q.stopUnhandledRejectionTracking();

function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'generic-users'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2014-10-03T19:00:00'; // Creation date of controller
    self.modified = '2014-10-03T19:00:00'; // Last modified date of controller
    self.group = ''; // Group this service to a origin

    /*
     * Express req paramter receives a new property req.miajs.userService which contains following data:
     *
     *      req.miajs.userData: Actual user data
     *
     *      req.miajs.userService = {
     *          data: data to override data contained in request body (contains e.g. login or password),
     *          userProfileData: user profile data
     *          userProfileModel: user profile model,
     *          options: options for login, signup, etc.,
     *          loginStatus: status of login/registration i.e. created|exists|merged
     *          group: group to be user for account,
     *          appId: profile section name to be used for account,
     *
     *          fbLoginParams: (optional) only for fbLogin
     *          signupParams: (optional) only for signup
     *      }
     */

    self.preconditions = {
        setParametersForSignup: {
            parameters: {
                body: {
                    login: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower',
                        required: true
                    },
                    email: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower'
                    },
                    password: {
                        desc: 'User‘s password',
                        type: String,
                        required: true
                    },
                    deviceName: {
                        desc: "Current device name",
                        type: String,
                        required: false
                    }
                }
            },
            responses: {
                401: "LoginInvalid"
            }
        },
        signUp: {
            responses: {
                401: "LoginInvalid"
            }
        },
        login: {
            parameters: {
                body: {
                    login: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower',
                        required: true
                    },
                    password: {
                        desc: 'User‘s password',
                        type: String,
                        required: true
                    },
                    deviceName: {
                        desc: "Current device name",
                        type: String,
                        required: false
                    }
                }
            },
            responses: {
                401: "InvalidCredentials",
                403: "MaxDeviceNumberExceeded"
            }
        },
        logout: {
            responses: {
                200: "Success"
            }
        },
        requestPasswordReset: {
            parameters: {
                body: {
                    login: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower',
                        required: true
                    }
                }
            },
            responses: {
                401: "LoginInvalid"
            }
        },
        resetPassword: {
            parameters: {
                body: {
                    token: {
                        desc: 'Password reset token',
                        type: String,
                        required: true
                    },
                    password: {
                        desc: 'User‘s new password',
                        type: String,
                        required: true
                    }
                }
            },
            responses: {
                401: "InvalidPasswordResetToken"
            }
        },
        getProfile: {
            parameters: {
                header: {
                    "if-none-match": {
                        desc: "ETag of the last object state known to the client",
                        type: String
                    }
                }
            },
            responses: {
                200: "Success"
            }
        },
        updateProfile: {
            parameters: {
                header: {
                    "if-match": {
                        desc: "ETag of the last object state known to the client",
                        type: String,
                        required: true
                    }
                },
                body: {
                    login: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower'
                    },
                    email: {
                        desc: 'User‘s login',
                        type: String,
                        convert: 'lower'
                    },
                    password: {
                        desc: 'User‘s password',
                        type: String
                    }
                }
            },
            responses: {
                412: "PreconditionFailedETag"
            }
        },
        deleteAccount: {
            responses: {
                412: "PreconditionFailedETag"
            }
        },
        validateUser: {
            parameters: {
                body: {
                    token: {
                        desc: 'Validation token',
                        type: String,
                        required: true
                    }
                }
            },
            responses: {
                200: "Success",
                401: "InvalidValidationToken"
            }
        },
        invalidateUser: {
            parameters: {
                body: {
                    token: {
                        desc: 'Invalidation token',
                        type: String,
                        required: true
                    }
                }
            },
            responses: {
                200: "Success",
                401: "InvalidInvalidationToken"
            }
        }
    };

    var _authOptions = {
        salt: '6sdsv2390n4v83nvl5umfd77gmlgl89ghnbvsacvk4po5mcslsfvnoip56bfdblwe67q3b2cdvk23vkadv',
        maxDeviceCount: 10
    };

    /**
     * Sets initial parameters for signup. Uses parameters stored in req.miajs.userService
     * @param req
     * @param res
     * @param next
     */
    self.setParametersForSignup = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        var params = {
            group: req.miajs.userService.group || req.miajs.route.group,
            login: body.login,
            email: body.email || body.login,
            password: body.password,
            appId: req.miajs.userService.appId || req.miajs.route.group,
            nativeLoginIsSet: true,
            userProfileData: req.miajs.userService.userProfileData,
            userProfileModel: req.miajs.userService.userProfileModel || UserProfileModel,
            thirdPartyTokens: null,
            deviceName: body.deviceName,
            deviceId: req.miajs.device.id,
            options: req.miajs.userService.options || _authOptions
        };

        AuthManager.prepareDataForSignup(params).then(function (params) {
            req.miajs.userService.signupParams = params;
            next();
        }).done();
    };

    var _getUserAccountResponse = function (req, res, userData, appId) {
        req.miajs.userData = userData;
        var userProfile = AuthManager.getUserAccountResponse(userData, appId);
        res.header('ETag', userData.etag);
        res.response = userProfile;
        return Q();
    };

    self.getUserAccountResponse = function (req, res, next) {
        _getUserAccountResponse(req, res, req.miajs.userData, req.miajs.route.group);
        next();
    };

    /**
     * SignUp user, login user and set profile data if given.
     * Uses req.miajs.userService.signupParams, which should be set in previous controller chained by routing
     * @param req
     * @param res
     * @param next
     */
    self.signUp = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var translator = req.miajs.translator || Translator.default;

        //checking preconditions for chaining this controller
        if (!req.miajs.device || !req.miajs.userService || !req.miajs.userService.signupParams) {
            Logger.error("Failure in chaining controllers.");
            next({status: 500});
            return;
        }
        var params = req.miajs.userService.signupParams;

        AuthManager.signUpUser(params).then(function (userData) {
            if (!userData) {
                return Q.reject({status: 500}); //should normally never be the case
            }
            else {
                //login user optionally
                if (params.options.loginOnSignUp === true) {
                    return AuthManager.loginUser(params).then(function (userData) {
                        if (!userData) {
                            return Q.reject({status: 500}); //should normally never be the case
                        }
                        else {
                            _getUserAccountResponse(req, res, userData, params.appId);
                            next();
                        }
                    });
                }
                else {
                    _getUserAccountResponse(req, res, userData, params.appId);
                    next();
                }
            }
        }).fail(function (err) {
            //Logger.error(err);
            next(err);
        }).done();
    };

    /**
     * Login device and generate accessTokens
     * @param req
     * @param res
     * @param next
     */
    self.login = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        //checking preconditions for chaining this controller
        if (!req.miajs.device) {
            Logger.error('Missing req.miajs.device. Failure in chaining controllers.');
            next({status: 500});
            return;
        }

        var params = {
            login: body.login,
            password: body.password,
            group: req.miajs.userService.group || req.miajs.route.group,
            appId: req.miajs.userService.appId || req.miajs.route.group,
            deviceId: req.miajs.device.id,
            deviceName: body.deviceName,
            options: req.miajs.userService.options || _authOptions
        };

        AuthManager.loginUser(params).then(function (userData) {
            if (!userData) {
                return Q.reject({status: 500}); //should normally never be the case
            }
            else {
                req.miajs.userService.loginStatus = "created"; // set loginStatus
                _getUserAccountResponse(req, res, userData, params.appId);
                next();
            }
        }).fail(function (err) {
            next(err);
        }).done();
    };

    self.setParametersForFbLogin = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || MemberHelpers.getPathPropertyValue(req, 'miajs.validatedParameters.body') || {};
        var translator = req.miajs.translator || Translator.default;

        var params = {
            group: req.miajs.userService.group || req.miajs.route.group,
            appId: req.miajs.userService.appId || req.miajs.route.group,
            deviceId: req.miajs.device.id,
            deviceName: body.deviceName,
            userProfileModel: req.miajs.userService.userProfileModel || UserProfileModel,
            options: req.miajs.userService.options || _authOptions,
            thirdPartyLogin: req.miajs.userService.thirdPartyLogin,
            email: req.miajs.userService.email
        };

        if (req.miajs.userService.onCreate) {
            params.onCreate = {
                userProfileData: req.miajs.userService.onCreate.userProfileData
            }
        }
        if (req.miajs.userService.onMerge) {
            params.onMerge = {
                userProfileData: req.miajs.userService.onMerge.userProfileData
            }
        }
        req.miajs.userService.fbLoginParams = params;
        next();
    };

    self.loginUserWithFacebook = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var translator = req.miajs.translator || Translator.default;

        //checking preconditions for chaining this controller
        if (!req.miajs.device
            || !req.miajs.userService
            || !req.miajs.userService.fbLoginParams
            || !req.miajs.userService.fbLoginParams.thirdPartyLogin) {
            Logger.error("Failure in chaining controllers.");
            next({status: 500});
            return;
        }
        var params = req.miajs.userService.fbLoginParams;

        Q.all([
            (function () {
                return AuthManager.processProfileData({
                    appId: params.appId,
                    userProfileModel: params.userProfileModel,
                    userProfileData: MemberHelpers.getPathPropertyValue(params, 'onCreate.userProfileData'),
                    options: {
                        setCreatedAt: true
                    }
                });
            })(),
            (function () {
                return AuthManager.processProfileData({
                    appId: params.appId,
                    userProfileModel: params.userProfileModel,
                    userProfileData: MemberHelpers.getPathPropertyValue(params, 'onMerge.userProfileData'),
                    options: {
                        setCreatedAt: false
                    }
                });
            })()
        ]).spread(function (paramsOnCreate, paramsOnMerge) {
            params.onCreate = {userProfileData: paramsOnCreate.userProfileData};
            params.onMerge = {userProfileData: paramsOnMerge.userProfileData};
            return Q(params);
        }).then(function (params) {
            return AuthManager.signupWithThirdPartyProvider(params).then(function (loginData) {
                params.userData = loginData.userData;
                // Set login status [created, merged, exists]
                req.miajs.userService.loginStatus = loginData.loginStatus;
                return AuthManager.loginUserCore(params).then(function (userData) {
                    if (!userData) {
                        return Q.reject({status: 500}); //should normally never be the case
                    }
                    else {
                        _getUserAccountResponse(req, res, userData, params.appId);
                        next();
                    }
                });
            });
        }).fail(function (err) {
            //Logger.error(err);
            next(err);
        });
    };

    /**
     * Logout device and remove accessTokens
     * @param req
     * @param res
     * @param next
     */
    self.logout = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var translator = req.miajs.translator || Translator.default;

        var group = req.miajs.userService.group || req.miajs.route.group;

        if (!req.miajs.device) {
            Logger.error('Missing req.miajs.device. Failure in chaining controllers.');
            next({status: 500});
            return;
        }
        var deviceId = req.miajs.device.id;

        AuthManager.logoutAnyUserFromDevice(deviceId, group).then(function (userData) {
            next();
        }).fail(function (err) {
            next(err);
        }).done();
    };

    /**
     * Get profile data
     * @param req
     * @param res
     * @param next
     */
    self.getProfile = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var translator = req.miajs.translator || Translator.default;

        var etag = req.header('if-none-match');
        var appId = req.miajs.userService.appId || req.miajs.route.group;

        if (!req.miajs.device) {
            Logger.error('Missing req.miajs.device. Failure in chaining controllers.');
            next({status: 500});
            return;
        }

        if (!req.miajs.userData || !req.miajs.userData._id) {
            next({status: 500});
            return;
        }

        Q().then(function () {
            if (!_.isEmpty(req.miajs.userData.etag)) {
                //user data already contains etag, return actual user data
                return Q(req.miajs.userData);
            }
            else {
                return AuthManager.getUserDataEnsuringEtag(req.miajs.userData._id);
            }
        }).then(function (userData) {
            if (!userData) {
                return Q.reject({status: 500});
            }
            else {
                if (userData.etag == etag && etag != null) {
                    res.header('ETag', userData.etag);
                    res.status(304);
                    next();
                }
                else {
                    _getUserAccountResponse(req, res, userData, appId);
                    next();
                }
            }
        }).fail(function (err) {
            next(err);
        }).done();
    };

    /**
     * Update user profile data.
     * Uses default UserProfileModel and body data or uses custom req.miajs.userService.model and req.miajs.userService.data if set in previous controller chained by routing
     * @param req
     * @param res
     * @param next
     */
    self.updateProfile = function (req, res, next) {
        _updateProfile(req, res, next);
    };

    /**
     * Same as updateProfile, but doesn't define any request parameters
     * @param req
     * @param res
     * @param next
     */
    self.updateProfileInternal = function (req, res, next) {
        _updateProfile(req, res, next);
    };

    /**
     * Update user profile data.
     * Uses default UserProfileModel and body data or uses custom req.miajs.userService.model and req.miajs.userService.data if set in previous controller chained by routing
     * @param req
     * @param res
     * @param next
     */
    var _updateProfile = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        //checking preconditions for chaining this controller
        if (!req.miajs.device) {
            Logger.error("Missing session or validatedParameters in req.miajs. Failure in chaining controllers.");
            next({status: 500});
            return;
        }

        if (!req.miajs.userData || !req.miajs.userData._id) {
            next({status: 500});
            return;
        }

        var params = {
            group: req.miajs.userService.group || req.miajs.route.group,
            login: body.login,
            email: body.email,
            etag: req.header('if-match'),
            password: body.password,
            translator: translator,
            appId: req.miajs.userService.appId || req.miajs.route.group,
            userData: req.miajs.userData,
            userProfileData: req.miajs.userService.userProfileData,
            userProfileModel: req.miajs.userService.userProfileModel || UserProfileModel,
            thirdPartyTokens: null,
            options: req.miajs.userService.options || _authOptions
        };
        if (!_.isEmpty(body.login)) {
            params.login = body.login;
            params.nativeLoginIsSet = true;
        }

        return AuthManager.updateUserProfileData(params).then(function (userData) {
            if (!userData) {
                res.status(412);
            }
            else {
                _getUserAccountResponse(req, res, userData, params.appId);
            }
            next();
        }).fail(function (err) {
            next(err);
        });
    };


    /**
     * Delete user account. Account will be marked as inactive and later deleted by a cron job
     * @param req
     * @param res
     * @param next
     */
    self.deleteAccount = function (req, res, next) {
        req.miajs = req.miajs || {};
        var translator = req.miajs.translator || Translator.default;

        if (!req.miajs.device) {
            Logger.error('Missing req.miajs.device. Failure in chaining controllers.');
            next({status: 500});
            return;
        }

        if (!req.miajs.userData || !req.miajs.userData.login || !req.miajs.userData.group) {
            next({status: 500});
            return;
        }
        var userData = req.miajs.userData;

        AuthManager.deleteUser(userData.login, userData.group).then(function () {
            next();
        }).fail(function (err) {
            next(err);
        }).done();
    };

    /**
     * Generates reset token and adds token to db collection in section inspectTokens.
     * This token should be send to user i.e. via email or push and allows the user to reset the password using resetPassword method
     * @param req
     * @param res
     * @param next
     */
    self.requestPasswordReset = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        var login = body.login;
        var group = req.miajs.userService.group || req.miajs.route.group;

        AuthManager.getPasswordResetToken(login, group).then(function (userData) {
            if (!_.isEmpty(userData)) {
                req.miajs.userData = userData;
                next();
            }
            else {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'LoginInvalid',
                        'msg': translator('generic-translations', 'LoginInvalid')
                    }
                });
            }
        }).fail(function (err) {
            if (err.status == 401) {
                _setAuthentificateHeader(req, res);
            }
            next(err);
        }).done();
    };

    var _setAuthentificateHeader = function (req, res) {
        var protocol = req.header('X-Forwarded-Proto') || req.protocol;
        res.setHeader('WWW-Authenticate', 'Credentials realm="' + protocol.toLowerCase() + "://" + req.headers.host.toLowerCase() + req.miajs.route.url + '"');
    };

    /**
     * Reset user password by providing a token (see requestPasswordReset) and a new password
     * @param req
     * @param res
     * @param next
     */
    self.resetPassword = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        var passwordResetToken = body.token;
        var newPassword = body.password;
        var options = req.miajs.userService.options || _authOptions;
        options.ignoreEtag = true;

        AuthManager.resetPassword(passwordResetToken, newPassword, options).then(function (userData) {
            if (!_.isEmpty(userData)) {
                next();
            }
            else {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'InvalidPasswordResetToken',
                        'msg': translator('generic-translations', 'InvalidPasswordResetToken')
                    }
                });
            }
        }).fail(function (err) {
            if (err.status == 401) {
                _setAuthentificateHeader(req, res);
            }
            next(err);
        }).done();
    };

    /**
     * Set validated:true if is called and validationtoken is valid.
     * This can be used to validate an email address and submit the validation token inside the email i.e. "click here to validate your account"
     * @param req
     * @param res
     * @param next
     */
    self.validateUser = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        var validateToken = body.token;
        AuthManager.validateUser(validateToken).then(function (userData) {
            if (!_.isEmpty(userData)) {
                next();
            }
            else {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'InvalidValidationToken',
                        'msg': translator('generic-translations', 'InvalidValidationToken')
                    }
                });
            }
        }).fail(function (err) {
            if (err.status == 401) {
                _setAuthentificateHeader(req, res);
            }
            next(err);
        }).done();
    };

    /**
     * Removes the user if is called and invalidationtoken is valid.
     * This can be used to validate an email address and submit the invalidation token inside the email. User should call this function if signup wasn requested by him and email address was used abusive i.e. "click here if you haven't signed up by yourself"
     * @param req
     * @param res
     * @param next
     */
    self.invalidateUser = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.userService.data || req.miajs.validatedParameters.body || {};
        var translator = req.miajs.translator || Translator.default;

        var removeToken = body.token;
        AuthManager.invalidateUser(removeToken).then(function (userData) {
            if (!_.isEmpty(userData)) {
                next();
            }
            else {
                return Q.reject({
                    status: 401,
                    err: {
                        'code': 'InvalidInvalidationToken',
                        'msg': translator('generic-translations', 'InvalidInvalidationToken')
                    }
                });
            }
        }).fail(function (err) {
            if (err.status == 401) {
                _setAuthentificateHeader(req, res);
            }
            next(err);
        }).done();
    };

    return self;
};

module.exports = new thisModule();
