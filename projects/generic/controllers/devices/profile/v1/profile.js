/**
 * deviceProfileService
 *
 * @module      :: Controller
 * @description :: Services to create device and update device data
 */

var MiaJs = require('mia-js-core');
var Logger = MiaJs.Logger;
var MemberHelpers = MiaJs.Utils.MemberHelpers;
var Shared = MiaJs.Shared;
var _ = require('lodash');
var AuthService = Shared.libs("generic-deviceAndSessionAuth");

function thisModule() {
    var self = this;

    self.disabled = false; // Enable /disable controller
    self.identity = 'generic-deviceProfile'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2014-01-09T19:00:00'; // Creation date of controller
    self.modified = '2014-01-09T19:00:00'; // Last modified date of controller
    self.group = ''; // Group this service to a origin

    self.preconditions = {
        create: {
            parameters: {
                body: {
                    culture: {
                        code: {
                            type: String,
                            minLength: 5,
                            maxLength: 5,
                            match: /[a-zA-Z]{2}-[a-zA-Z]{2}/i
                        }
                    },
                    app: {
                        id: {
                            type: String,
                            minLength: 5,
                            maxLength: 50
                        },
                        version: {
                            type: String,
                            minLength: 1,
                            maxLength: 7,
                            match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
                        },
                        vendor: {
                            id: {
                                type: String,
                                minLength: 5,
                                maxLength: 50
                            }
                        },

                        advertiser: {
                            id: {
                                type: String,
                                minLength: 5,
                                maxLength: 50
                            }
                        }
                    },

                    device: {
                        model: {
                            type: String,
                            minLength: 1,
                            maxLength: 50
                        },
                        os: {
                            type: {
                                type: String,
                                minLength: 2,
                                maxLength: 50
                            },
                            version: {
                                type: String,
                                minLength: 1,
                                maxLength: 7,
                                match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
                            }
                        },
                        carrier: {
                            type: {
                                type: String,
                                minLength: 1,
                                maxLength: 50
                            }
                        },
                        screen: {
                            resolution: {
                                type: String,
                                match: /(\d+)x(\d+)/i
                            }
                        },
                        notification: {
                            token: {
                                type: String
                            }
                        }
                    }
                }
            },
            responses: {
                400: "BodyDataIsEmpty"
            }
        },
        update: {
            parameters: {
                path: {
                    id: {
                        desc: "Device Id",
                        type: String,
                        minLength: 32,
                        maxLength: 32,
                        required: true
                    }
                },
                body: {
                    culture: {
                        code: {
                            type: String,
                            minLength: 5,
                            maxLength: 5,
                            match: /[a-zA-Z]{2}-[a-zA-Z]{2}/i
                        }
                    },
                    app: {
                        id: {
                            type: String,
                            minLength: 5,
                            maxLength: 50
                        },
                        version: {
                            type: String,
                            minLength: 1,
                            maxLength: 7,
                            match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
                        },
                        vendor: {
                            id: {
                                type: String,
                                minLength: 5,
                                maxLength: 50
                            }
                        },

                        advertiser: {
                            id: {
                                type: String,
                                minLength: 5,
                                maxLength: 50
                            }
                        }
                    },

                    device: {
                        model: {
                            type: String,
                            minLength: 1,
                            maxLength: 50
                        },
                        os: {
                            type: {
                                type: String,
                                minLength: 2,
                                maxLength: 50
                            },
                            version: {
                                type: String,
                                minLength: 1,
                                maxLength: 7,
                                match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
                            }
                        },
                        carrier: {
                            type: {
                                type: String,
                                minLength: 1,
                                maxLength: 50
                            }
                        },
                        screen: {
                            resolution: {
                                type: String,
                                match: /(\d+)x(\d+)/i
                            }
                        },
                        notification: {
                            token: {
                                type: String
                            }
                        }
                    }
                }
            },
            responses: {
                400: ["BodyDataIsEmpty", "DeviceIdDoesNotExist"]
            }
        }
    };

    self.create = function (req, res, next) {
        var data = req.miajs.validatedParameters.body || {}
            , translator = req.miajs.translator;

        MemberHelpers.setPathPropertyValue(data, 'device.userAgent', req.headers['user-agent']);

        AuthService.createDevice({translator: translator}, data, 5).then(function (id) {
            Logger.info('Device ' + id + ' created');
            res.response = {id: id};
            res.header("timestamp", Date.now());
            next();
        }).fail(function (err) {
            res.header("timestamp", Date.now());
            next(err);
        }).done();
    };

    self.update = function (req, res, next) {
        var translator = req.miajs.translator;
        var id = req.params['id']
            , data = req.miajs.validatedParameters.body || {};

        if (id != req.miajs.device.id) {
            res.header("timestamp", Date.now());
            return next({status: 403});
        }

        MemberHelpers.setPathPropertyValue(data, 'device.userAgent', req.headers['user-agent']);
        if (_.isEmpty(data)) {
            res.header("timestamp", Date.now());
            return next({
                status: 400,
                err: {'code': 'BodyDataIsEmpty', 'msg': translator('generic-translations', 'BodyDataIsEmpty')}
            });
        }

        AuthService.updateDevice({translator: translator}, id, data)
            .then(function (id) {
                Logger.info('Device ' + id + ' updated');
                res.response = {id: id};
                res.header("timestamp", Date.now());
                return next();
            })
            .fail(function (err) {
                res.header("timestamp", Date.now());
                next(err);
            })
        ;
    };

    return self;
};

module.exports = new thisModule();