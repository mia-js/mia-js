/**
 * services
 *
 * @module      :: Controller
 * @description :: This service lists all available services
 */

var MiaJs = require("mia-js-core")
    , Shared = MiaJs.Shared
    , ServicesHandler = Shared.libs("generic-servicesManager");

function thisModule() {

    var self = this;
    // Disable controller
    self.disabled = false;
    self.identity = 'generic-listServices'; // Controller name used in routes, policies and followups
    self.version = '2.0'; // Version number of service
    self.created = '2014-05-23T00:00:00'; // Creation date of controller
    self.modified = '2020-03-12T18:00:00'; // Last modified date of controller

    self.preconditions = {
        list: {
            responses: {
                200: "Success",
                500: "UnknownServiceGroupOrVersion"
            }
        }
    };

    self.list = function (req, res, next) {
        var Translator = req.miajs.translator;

        var hostId = req.miajs.route.hostId;
        var version = req.miajs.route.version;
        var group = req.miajs.route.group;
        var prefix = req.miajs.route.prefix;

        if (group && version) {
            res.response = ServicesHandler.getServicesInfoByReq(req, hostId, group, version, prefix);
            next();
        }
        else {
            next(new MiaJs.Error({'status': 500,
                err: {
                    'code': 'UnknownServiceGroupOrVersion',
                    'msg': Translator('generic-translations', 'UnknownServiceGroupOrVersion')
                }
            }));
        }
    };

    return self;
};

module.exports = new thisModule();