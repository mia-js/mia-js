/**
 * Outputs the response as HTML document
 */
var MiaJs = require('mia-js-core')
    , _ = require('lodash');

function thisModule() {
    var self = this;
    self.identity = 'html-output'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (req, res) {
        res.response = '<!DOCTYPE html>' + res.response;
        res.send(res.response);
    };

    return self;
};

module.exports = new thisModule();