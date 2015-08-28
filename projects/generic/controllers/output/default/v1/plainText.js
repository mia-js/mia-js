/**
 * @description :: Outputs the response as JSON document
 */
var MiaJs = require('mia-js-core')
    , _ = require('lodash');

function thisModule() {
    var self = this;
    self.identity = 'generic-plainTextResponse'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (req, res) {
        res.send(res.response, 200);
    };

    return self;
};

module.exports = new thisModule();