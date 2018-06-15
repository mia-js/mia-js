/**
 * validateSessionService
 *
 * @module      :: Policy
 * @description :: Validates if a client device has provided a valid session token. Device should have received a valid session token using the generate session service.
 */

var MiaJs = require('mia-js-core')
    , _ = require('lodash')
    , Shared = MiaJs.Shared
    , AuthService = Shared.libs("generic-userAuthManager")

function thisModule() {
    var self = this;
    self.identity = 'generic-evaluateOptionalUserLogin'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (req, res, next) {
        var translator = req.miajs.translator;

        req.miajs = req.miajs || {};

        if (!req.miajs.device) {
            next({status: 500, 'msg': translator('generic-translations', 'InternalServerError')});
            return;
        }

        req.miajs.userService = req.miajs.userService || {};
        var group = req.miajs.userService.group || req.miajs.route.group;

        AuthService.getUserLoggedInOnDevice(req.miajs.device.id, group).then(function (userData) {
            if (userData) {
                req.miajs.userData = userData;
            }
            next();
        }).catch(function (err) {
            next(err);
        });
    };

    return self;
};

module.exports = new thisModule();
