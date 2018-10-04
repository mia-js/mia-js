/**
 * Rate Limit
 *
 * @module      :: Controller
 * @description :: Rate limits access.
 *
 * Create a custom controller and nest in routing before this controller.
 * Apply the following data in one of the previous controllers:
 * Example:
 * req.miajs.rateLimit = {
 *      key: "myAccessKey",
 *      interval: 5,
 *      maxRequests: 20
 * }
 */


var MiaJs = require("mia-js-core")
    , Shared = MiaJs.Shared
    , RateLimiter = MiaJs.RateLimiter;

function thisModule() {

    var self = this;
    // Disable controller
    self.disabled = false;
    self.identity = 'generic-rateLimiter'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-03-01T00:00:00'; // Creation date of controller
    self.modified = '2015-03-01T00:00:00'; // Last modified date of controller

    self.all = function (req, res, next) {

        var rateLimit = req.miajs.rateLimit;

        if (!rateLimit || !rateLimit.key) {
            next();
            return;
        }

        if (!rateLimit.interval || !_.isNumber(rateLimit.interval) || parseInt(rateLimit.interval) <= 0) {
            next();
            return;
        }

        if (!rateLimit.maxRequests && !_.isNumber(rateLimit.maxRequests) && parseInt(rateLimit.maxRequests) <= 0) {
            next();
            return;
        }

        var Translator = req.miajs.translator;
        return RateLimiter.checkRateLimitByKey(rateLimit.key, rateLimit.interval, rateLimit.maxRequests).then(function (rateLimiterResult) {
            if (rateLimiterResult.remaining == -1) {
                res.header("X-Rate-Limit-Limit", rateLimiterResult.limit);
                res.header("X-Rate-Limit-Remaining", 0);
                res.header("X-Rate-Limit-Reset", rateLimiterResult.timeTillReset);
                next({
                    status: 429,
                    err: {
                        'code': 'RateLimitExceededForKey',
                        'msg': Translator('generic-translations', 'RateLimitExceededForKey')
                    }
                });
            }
            else {
                res.header("X-Rate-Limit-Limit", rateLimiterResult.limit);
                res.header("X-Rate-Limit-Remaining", rateLimiterResult.remaining);
                res.header("X-Rate-Limit-Reset", rateLimiterResult.timeTillReset);

                next();

            }
        }).catch(function () {
            // Ignore rate limit due to failure
            next();
        });

    };

    return self;
};

module.exports = new thisModule();

