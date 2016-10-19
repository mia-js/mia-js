/**
 * @description :: Outputs the response as an XML document
 */
var Xml2js = require('xml2js');
var _ = require('lodash');

function thisModule() {
    var self = this;
    self.identity = 'generic-defaultXMLResponse';
    self.version = '1.0';

    self.all = function (req, res) {
        var builder = new Xml2js.Builder({cdata: true});
        res.response = builder.buildObject(res.response);

        // Set cache control header if res.cached is provided
        if (res.cached && res.cached.timeleft && _.isNumber(res.cached.timeleft)) {
            res.setHeader('Cache-Control', 'public, max-age=' + res.cached.timeleft);
        }

        res.set('Content-Type', 'application/xml');
        res.send(res.response, res.statusCode);
    };

    return self;
}

module.exports = new thisModule();