/**
 * Custom logging function like console.log
 */

var Shared = require('mia-js-core/lib/shared');
var Logger = require('mia-js-core/lib/logger');

function thisModule() {

    var self = this;

    self.init = function () {
        //Add some initial tasks here run on server startup i.e. writing initial data
    };

    return self;
};

module.exports = new thisModule();