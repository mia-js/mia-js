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
    self.version = '1.0'; // Version number of service
    self.created = '2014-05-23T00:00:00'; // Creation date of controller
    self.modified = '2014-05-23T00:00:00'; // Last modified date of controller

    self.preconditions = {
        list: {
            responses: {
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

            var servicesList = ServicesHandler.getServicesInfoByReq(req, hostId, group, version, prefix)

            // Convert services v1 to old format due to getSericesInfoByReq has been modified
            for (var service in servicesList) {
                servicesList[service]["requiresSession"] = servicesList[service]["authorization"];
                delete(servicesList[service]["authorization"]);
                servicesList[service]["name"] = servicesList[service]["id"]
                delete(servicesList[service]["id"]);
                delete(servicesList[service]["parameters"]);
                delete(servicesList[service]["responses"]);
                if (servicesList[service]["method"]) {
                    servicesList[service]["requestMethods"] = [servicesList[service]["method"]];
                    delete(servicesList[service]["method"]);
                }


            }
            res.response = servicesList;
            next();
        }
        else {
            next({
                'status': 500,
                err: {
                    'code': 'UnknownServiceGroupOrVersion',
                    'msg': Translator('generic-translations', 'UnknownServiceGroupOrVersion')
                }
            });
        }
    };

    return self;
};

module.exports = new thisModule();