/**
 * validateSessionService
 *
 * @module      :: Policy
 * @description :: Validates if a client device has provided a valid session token. Device should have received a valid session token using the generate session service.
 */

var MiaJs = require('mia-js-core')
    , _ = require('lodash')
    , Shared = MiaJs.Shared
    , AuthService = Shared.libs("generic-deviceAndSessionAuth");

function thisModule() {
    var self = this;

    self.identity = 'generic-validateSession'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.preconditions = {
        all: {
            parameters: {
                header: {
                    session: {
                        desc: "Session token",
                        type: String,
                        minLength: 64,
                        maxLength: 64,
                        required: true
                    },
                    date: {
                        desc: "Date string when client request was initiated i.e. 2015-01-01T00:00:00",
                        type: Date
                    }
                }
            },
            responses: {
                403: ["SessionTokenNotValid", "NoIPDetermined", "TemporaryDisabled", "SessionInvalidGroup", "IPNotAllowed"],
                400: "SessionTokenEmpty"
            }
        }
    };

    self.all = function (req, res, next) {
        var sessionId = req.header('session')
            , ip = req.header('X-Forwarded-For') || req.ip
            , group = req.miajs.route.group
            , translator = req.miajs.translator;

        if (!req.miajs) {
            req.miajs = {};
        }

        if (!req.miajs.device) {
            req.miajs.device = {};
        }

        if (_.isEmpty(ip)) {
            next({'status': 403, err: {'code': 'NoIPDetermined', 'msg': Translator('generic-translations', 'NoIPDetermined')}});
            return;
        }

        if (!sessionId || sessionId == '') {
            next({
                status: 400,
                err: {'code': 'SessionTokenEmpty', 'msg': translator('generic-translations', 'SessionTokenEmpty')}
            });
            return;
        }

        AuthService.validateSessionToken({translator: translator}, sessionId, ip, group)
            .then(function (deviceData) {

                // Calculate datetime offset between server and client in milliseconds if header field requestdate is set and valid date
                var deviceDate = new Date(req.headers.date);
                var dateNow = new Date(Date.now());
                if (deviceDate != "Invalid Date") {
                    deviceData.timeOffset = deviceDate - dateNow;
                }
                else {
                    deviceData.timeOffset = 0;
                }

                req.miajs.device = deviceData;
                next();
            })
            .fail(function (err) {
                next(err);
            })
            ;
    };

    return self;
};

module.exports = new thisModule();
