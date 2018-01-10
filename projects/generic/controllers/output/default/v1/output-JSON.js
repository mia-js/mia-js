/**
 * @description :: Outputs the response as JSON document
 */
var MiaJs = require('mia-js-core')
    , _ = require('lodash')
    , Translator = MiaJs.GetTranslations;

function thisModule() {
    var self = this;
    self.identity = 'generic-defaultJSONResponse'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (req, res) {

        var translator = req.miajs.translator || Translator.default;

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

        // Set cache control header if res.cached is provided
        if (res.cached && res.cached.timeleft && _.isNumber(res.cached.timeleft)) {
            res.setHeader('Cache-Control', 'public, max-age=' + res.cached.timeleft);
        }

        res.status(response.status).send(response);
    };

    return self;
};

module.exports = new thisModule();