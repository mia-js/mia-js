/**
 * @description :: Outputs the errors as JSON document
 */


//TODO: Implement default errors using ErrorHandler with different output possibilities JSON, HTML


var MiaJs = require('mia-js-core')
    , _ = require('lodash')
    , Xml2js = require('xml2js')
    , ErrorHandler = MiaJs.ErrorHandler;

function thisModule() {
    var self = this;
    self.identity = 'generic-defaultXMLErrorResponse'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (err, req, res) {
        var output = ErrorHandler.handleError(err, req, res);
        var builder = new Xml2js.Builder({cdata: true});
        output.response = builder.buildObject({error: output.response});
        res.set('Content-Type', 'application/xml');
        res.status(output.status).send(output.response);
    };

    return self;
};

module.exports = new thisModule();