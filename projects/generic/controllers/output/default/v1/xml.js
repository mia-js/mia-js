/**
 * @description :: Outputs the response as an XML document
 */
var Xml2js = require('xml2js');

function thisModule() {
    var self = this;
    self.identity = 'generic-xmlResponse';
    self.version = '1.0';

    self.all = function (req, res) {
        var builder = new Xml2js.Builder({cdata: true});
        res.response = builder.buildObject(res.response);
        res.set('Content-Type', 'application/xml');
        res.send(res.response, res.statusCode);
    };

    return self;
}

module.exports = new thisModule();