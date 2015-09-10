/**
 * generateSessionService
 *
 * @module      :: Controller
 * @description :: Generates a new session id for a device
 */

var MiaJs = require('mia-js-core');
var Shared = MiaJs.Shared;
var AuthService = Shared.libs("generic-deviceAndSessionAuth")

function thisModule() {
    var self = this;

    self.disabled = false; // Enable /disable controller
    self.identity = 'generic-generateSession'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2014-01-09T19:00:00'; // Creation date of controller
    self.modified = '2014-01-09T19:00:00'; // Last modified date of controller
    self.description = 'Get session token'; // Short description
    self.group = ''; // Group this service to a origin

    self.preconditions = {
        all: {
            parameters: {
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
                400: "Bad request",
                403: "DeviceIdInvalid"
            }
        }
    };

    /**
     * Request accesskey
     */
    self.all = function (req, res, next) {
        var id = req.params['id'],
            ip = req.header('X-Forwarded-For') || req.ip,
            groups = req.allowedAccessGroups,
            translator = req.miajs.translator;

        AuthService.generateSessionId({translator: translator}, id, ip, groups, 5)
            .then(function (sessionId) {
                res.response = {
                    sessionId: sessionId
                };
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