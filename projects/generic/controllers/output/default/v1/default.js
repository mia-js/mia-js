/**
 * @description :: Outputs the response as JSON document
 */
var MiaJs = require('mia-js-core')
    , _ = require('lodash')
    , Translator = MiaJs.GetTranslations;

function thisModule() {
    var self = this;
    self.identity = 'generic-defaultResponse'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    /*self.preconditions = {
        all: {
            parameters: {
                query: {
                    filter: {
                        desc: "Filter response by filter string i.e. 'id' to only return elements with name id. To receive multiple elements use , as delimiter",
                        type: String
                    }
                }
            },
            responses: {
                200: "Success"
            }
        }
    };*/

    var filterResponse = function (response, filter, arr) {
        var filteredResponse
            , subResponse;

        if (_.isArray(response) || arr == true) {
            filteredResponse = [];
        }
        else {
            filteredResponse = {};
        }

        if (_.isArray(response)) {
            arr = true;
        }

        for (var obj in response) {
            if (_.indexOf(filter, obj) != -1) {
                filteredResponse[obj] = response[obj];
            }
            else {
                if (_.isObject(response[obj])) {
                    if (_.isArray(response[obj])) {
                        subResponse = filterResponse(response[obj], filter, true);
                        if (!_.isEmpty(subResponse)) {
                            filteredResponse[obj] = subResponse;
                        }
                    }
                    else {
                        if (arr == true) {
                            subResponse = filterResponse(response[obj], filter);
                            if (!_.isEmpty(subResponse)) {
                                filteredResponse.push(subResponse);
                            }
                        }
                        else {
                            subResponse = filterResponse(response[obj], filter);
                            if (!_.isEmpty(subResponse)) {
                                filteredResponse[obj] = subResponse;
                            }
                        }
                    }
                }
            }
        }

        return filteredResponse;
    };

    self.all = function (req, res) {

        var translator = req.miajs.translator || Translator.default;
        // Set response filter. Filter all nodes except give in query param filter
        if (req.query.filter) {
            res.response = filterResponse(res.response, MiaJs.Utils.QueryParser(req.query.filter), false, 1);
        }

        var response = {};
        response.status = res.statusCode || 200;

        if (req.miajs && req.miajs.route && req.miajs.route.deprecated === true) {
            response.deprecated = true;
            response.notice = translator('generic-translations', 'ServiceIsDeprecated');
        }

        //Add debug data
        if (req && req.header && req.header('debug') == 'true') {
            response.debug = MiaJs.Utils.DebugCollector(req);
        }

        if (res.response) {
            response.response = res.response;
        }

        res.send(response, response.status);
    };

    return self;
};

module.exports = new thisModule();