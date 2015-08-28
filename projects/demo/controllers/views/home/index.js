/**
 * Controller to render an isomorphic example frontend page using React and Bootstrap Theme with Less
 * React frontend files are in folder "public"
 * An automatic route is generated for assets in folder "public" for the client to receive assets
 *
 * This example renders an isomorphic react page using server side rendering and client side rendering
 * Use Grunt (terminal: grunt watch) for creating a browserify js package for client side rendering
 */

var React = require('react')
    , Shared = require('mia-js-core').Shared
    , url = require('url')
    , ReactAsync = require('react-async')
    , App = require(Shared.projectPath('/demo/public/views/App.jsx'));

function thisModule() {
    var self = this;

    self.disabled = false; // Enable /disable controller
    self.identity = 'demo-home'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-14T12:00:00'; // Creation date of controller
    self.modified = '2015-07-14T12:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    //Frontend
    self.list = function (req, res, next) {
        App.run(req.url, function (err, markup) {
            res.response = markup;
            next();
        });
    };

    return self;
};


module.exports = new thisModule();

