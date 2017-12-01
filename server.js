// Wrap application in babel to enhance ES6 to node
require('babel-core/register');
require('babel-polyfill');

var MiaJs = require('mia-js-core').Run;

//Start mia.js
MiaJs.init(function (app) {
        // Add additional startup initialization here
    }
).then(function () {
        MiaJs.start();
    }
);