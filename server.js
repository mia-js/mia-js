// Wrap application in babel to enhance ES6 to node
require('@babel/register');
require('@babel/polyfill');

var Q = require('q');
var MiaJs = require('mia-js-core').Run;

//Start mia.js
MiaJs.init(function (app) {
        // Add additional startup initialization here
        return Q();
    }
).then(function () {
        MiaJs.start();
    }
);
