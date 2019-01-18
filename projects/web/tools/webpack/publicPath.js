const _ = require('lodash');
const routes = require('../../routes/index');

const routesPrefix = _.isArray(routes.prefix) ? routes.prefix[0] : routes.prefix;
const routesPrefixStripped = routesPrefix.replace(/\//g, routesPrefix);

module.exports = !_.isEmpty(routesPrefixStripped) ? routesPrefix + '/' : '';
