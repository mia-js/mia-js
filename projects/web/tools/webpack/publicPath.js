const _ = require('lodash');
const routes = require('../../routes/index');

const routesPrefix = _.isArray(routes.prefix) ? routes.prefix[0] : routes.prefix;

module.exports = !_.isEmpty(routesPrefix) ? routesPrefix + '/' : '/';
