var Shared = require('mia-js-core/lib/shared');

function thisModule() {

    var self = this;

    self.identity = 'generic-servicesManager'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service


    /**
     * Returns information about registered services for given 'group' (project name) and project 'version'
     * @param registeredServices
     * @param hostName
     * @param group
     * @param version
     * @returns {Array}
     */
    self.getFilteredServicesInfo = function (registeredServices, req, hostId, group, version, prefix) {

        var serviceInfos = [];
        var serviceInfo;

        var protocol = req.protocol;

        //Check for https redirected
        if (req.headers && req.headers["x-forwarded-proto"]) {
            protocol = req.headers["x-forwarded-proto"];
        }

        var hostname = req.headers.host;

        for (var serviceId in registeredServices) {
            var service = registeredServices[serviceId];

            if (service.group
                && service.version
                && service.hostId == hostId
                && (service.group).toLowerCase() == (group).toLowerCase()
                && (service.version).toLowerCase() == (version).toLowerCase()
                && (service.prefix == prefix)) {

                serviceInfo = {};
                serviceInfo.modified = service.modified;
                serviceInfo.method = service.requestMethod;

                if ((service.url).match(/(http|ftp|https)/i)) {
                    serviceInfo.url = service.url;
                }
                else {
                    serviceInfo.url = protocol + '://' + hostname + service.url;
                }
                serviceInfo.id = service.id;
                if (!_.isEmpty(service.parameters)) {
                    serviceInfo.parameters = service.parameters;
                }
                if (!_.isEmpty(service.responses)) {
                    serviceInfo.responses = service.responses;
                }

                if (service.deprecated === true) {
                    serviceInfo.deprecated = service.deprecated;
                }

                serviceInfo.authorization = service.authorization;

                serviceInfos.push(serviceInfo);
            }
        }
        return serviceInfos;
    };

    /**
     * Returns information about registered services for given 'group' (project name) and project 'version'. Uses information about server and host from the provided request.
     * @param registeredServices
     * @param req
     * @param group
     * @param version
     * @returns {Array}
     */
    self.getServicesInfoByReq = function (req, hostId, group, version, prefix) {
        return self.getFilteredServicesInfo(Shared.registeredServices(), req, hostId, group, version, prefix);
    };

    return self;
};

module.exports = new thisModule();