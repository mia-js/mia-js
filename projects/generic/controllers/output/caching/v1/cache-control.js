/**
 * @description :: Sets the Cache-Control Header to the response object
 */
let _ = require('lodash');

function thisModule() {
    let self = this;
    self.identity = 'generic-cachingCacheControl'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service

    self.all = function (req, res, next) {

        let maxAge = 0;

        // Set max-age to timeleft if res.cached is provided
        if (res.cached && res.cached.cacheTime && _.isNumber(res.cached.cacheTime)) {
            maxAge = res.cached.cacheTime;
        }

        res.setHeader('Cache-Control', 'public, max-age=' + maxAge);

        next();
    };

    return self;
}

module.exports = new thisModule();